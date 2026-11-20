from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Ticket, TicketUpdate, TicketFeedback
from .serializers import (
    TicketCreateSerializer,
    TicketDetailSerializer,
    TicketFeedbackSerializer,
)
from ai_engine.models import AIDecisionLog
from ai_engine.services import analyze_incident_with_gemini
from ai_engine.duplicate_detector import check_and_merge_duplicate
from ai_engine.routing import calculate_sla_deadline, auto_assign_technician


class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketDetailSerializer

    def get_queryset(self):
        user = self.request.user
        base_qs = Ticket.objects.filter(parent_ticket__isnull=True).order_by('-created_at')

        if user.role == 'admin':
            return base_qs
        elif user.role == 'technician':
            return base_qs.filter(assigned_to=user)
        return base_qs.filter(reporter=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save(reporter=request.user)

        # 1. Analyze incident text and image using Gemini AI
        image_path = ticket.image.path if ticket.image else None
        ai_result = analyze_incident_with_gemini(
            description=ticket.description,
            building=ticket.building or "",
            room_or_lab=ticket.room_or_lab or "",
            image_path=image_path
        )

        # 2. Update ticket metadata with AI triage results
        valid_categories = ['general', 'it', 'electrical', 'plumbing', 'lab_equipment']
        valid_urgencies = ['low', 'medium', 'high', 'critical']

        category = ai_result.get('category', 'general')
        urgency = ai_result.get('urgency', 'medium')

        if not ticket.title:
            ticket.title = ai_result.get('title') or ticket.description[:50]
        ticket.category = category if category in valid_categories else 'general'
        ticket.building = ai_result.get('building') or ticket.building
        ticket.room_or_lab = ai_result.get('room_or_lab') or ticket.room_or_lab
        ticket.urgency = urgency if urgency in valid_urgencies else 'medium'
        ticket.ai_confidence = float(ai_result.get('confidence_score', 0.0))
        ticket.ai_checklist = ai_result.get('checklist', [])
        ticket.save()

        # 3. Create initial timeline entry
        TicketUpdate.objects.create(
            ticket=ticket,
            updated_by=request.user,
            status='reported',
            note=f"Incident reported and analyzed by AI ({ticket.category.upper()} | Urgency: {ticket.urgency.upper()})."
        )

        # 4. Check for duplicate incidents in the same location and category
        parent_ticket = check_and_merge_duplicate(ticket)
        is_duplicate = parent_ticket is not None
        assign_reason = ""

        if is_duplicate:
            # Return the merged parent ticket details
            target_ticket = parent_ticket
            assign_reason = f"Merged into existing parent ticket #{parent_ticket.id}."
        else:
            # Set SLA deadline and auto-assign an on-duty technician for unique incidents
            ticket.sla_deadline = calculate_sla_deadline(ticket.urgency)
            ticket.save()
            assign_reason = auto_assign_technician(ticket)
            target_ticket = ticket

        # 5. Record transparent AI decision log
        AIDecisionLog.objects.create(
            ticket=ticket,
            detected_language=ai_result.get('detected_language', 'Unknown'),
            predicted_category=ticket.category,
            predicted_urgency=ticket.urgency,
            confidence_score=ticket.ai_confidence,
            reasoning=ai_result.get('reasoning', 'Classified by Gemini AI.'),
            is_duplicate_detected=is_duplicate,
            assigned_technician_reason=assign_reason,
            raw_ai_response=ai_result
        )

        detail_data = TicketDetailSerializer(target_ticket, context={'request': request}).data
        detail_data['is_duplicate_merged'] = is_duplicate
        return Response(detail_data, status=status.HTTP_201_CREATED)


class TicketDetailView(generics.RetrieveAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class TicketStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        user = request.user

        if user.role not in ['technician', 'admin']:
            return Response(
                {'error': 'Only technicians or admins can update ticket status.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        note = request.data.get('note', '')
        proof_image = request.FILES.get('proof_image')

        if new_status not in ['assigned', 'in_progress', 'resolved', 'escalated']:
            return Response(
                {'error': 'Invalid status value.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = new_status
        if new_status == 'resolved':
            ticket.resolved_at = timezone.now()
        ticket.save()

        TicketUpdate.objects.create(
            ticket=ticket,
            updated_by=user,
            status=new_status,
            note=note,
            proof_image=proof_image
        )

        return Response(TicketDetailSerializer(ticket, context={'request': request}).data)


class TicketFeedbackView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)

        if ticket.reporter != request.user:
            return Response(
                {'error': 'Only the reporter can submit feedback.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status != 'resolved':
            return Response(
                {'error': 'Feedback can only be submitted after the ticket is resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if hasattr(ticket, 'feedback'):
            return Response(
                {'error': 'Feedback has already been submitted for this ticket.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TicketFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ticket=ticket)

        return Response(serializer.data, status=status.HTTP_201_CREATED)