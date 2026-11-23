from rest_framework import serializers
from .models import AIDecisionLog


class AIDecisionLogSerializer(serializers.ModelSerializer):
    ticket_title = serializers.CharField(source='ticket.title', read_only=True)
    ticket_status = serializers.CharField(source='ticket.status', read_only=True)

    class Meta:
        model = AIDecisionLog
        fields = [
            'id', 'ticket', 'ticket_title', 'ticket_status',
            'detected_language', 'predicted_category', 'predicted_urgency',
            'confidence_score', 'reasoning', 'is_duplicate_detected',
            'assigned_technician_reason', 'created_at'
        ]