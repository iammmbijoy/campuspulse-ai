from rest_framework import generics, permissions
from .models import AIDecisionLog
from .serializers import AIDecisionLogSerializer


class AIDecisionLogListView(generics.ListAPIView):
    """
    Returns AI triage decision logs for transparency.
    Admins see all logs; other authenticated users see logs for their relevant tickets.
    """
    serializer_class = AIDecisionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = AIDecisionLog.objects.select_related('ticket').order_by('-created_at')

        if user.role == 'admin':
            return base_qs
        elif user.role == 'technician':
            return base_qs.filter(ticket__assigned_to=user)
        return base_qs.filter(ticket__reporter=user)