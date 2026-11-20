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


class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketDetailSerializer

    def get_queryset(self):
        user = self.request.user
        # শুধু মূল (Parent) টিকিটগুলো দেখানো হবে (ডুপ্লিকেটগুলো ভেতরে মার্জ থাকবে)
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

        # প্রথম টাইমলাইন হিস্ট্রি তৈরি করা
        TicketUpdate.objects.create(
            ticket=ticket,
            updated_by=request.user,
            status='reported',
            note='Incident reported by user.'
        )

        detail_data = TicketDetailSerializer(ticket, context={'request': request}).data
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