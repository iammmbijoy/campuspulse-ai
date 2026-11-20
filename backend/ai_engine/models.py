from django.db import models
from tickets.models import Ticket


class AIDecisionLog(models.Model):
    ticket = models.OneToOneField(
        Ticket,
        on_delete=models.CASCADE,
        related_name='ai_log'
    )
    detected_language = models.CharField(max_length=30, default='English')
    predicted_category = models.CharField(max_length=30)
    predicted_urgency = models.CharField(max_length=20)
    confidence_score = models.FloatField(default=0.0)
    reasoning = models.TextField()  # Explanation of why the AI made this classification
    is_duplicate_detected = models.BooleanField(default=False)
    assigned_technician_reason = models.TextField(blank=True)
    raw_ai_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Log for Ticket #{self.ticket.id} ({self.predicted_category} - {self.confidence_score})"