from rest_framework import serializers
from .models import Ticket, TicketUpdate, TicketFeedback
from ai_engine.models import AIDecisionLog


class AIDecisionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIDecisionLog
        fields = [
            'detected_language',
            'predicted_category',
            'predicted_urgency',
            'confidence_score',
            'reasoning',
            'is_duplicate_detected',
            'assigned_technician_reason',
            'created_at',
        ]


class TicketUpdateSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = TicketUpdate
        fields = ['id', 'status', 'note', 'proof_image', 'updated_by_name', 'created_at']


class TicketFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketFeedback
        fields = ['id', 'rating', 'comment', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'image', 'building', 'room_or_lab']


class TicketDetailSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.username', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True, default=None)
    updates = TicketUpdateSerializer(many=True, read_only=True)
    feedback = TicketFeedbackSerializer(read_only=True)
    ai_log = AIDecisionLogSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'reporter', 'reporter_name', 'title', 'description', 'image',
            'category', 'building', 'room_or_lab', 'urgency',
            'ai_confidence', 'ai_checklist', 'parent_ticket', 'duplicate_count',
            'assigned_to', 'assigned_to_name', 'status', 'sla_deadline',
            'is_escalated', 'created_at', 'updated_at', 'resolved_at',
            'updates', 'feedback', 'ai_log'
        ]