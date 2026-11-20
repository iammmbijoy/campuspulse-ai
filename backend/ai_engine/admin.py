from django.contrib import admin
from .models import AIDecisionLog


@admin.register(AIDecisionLog)
class AIDecisionLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'detected_language', 'predicted_category', 'predicted_urgency', 'confidence_score', 'is_duplicate_detected', 'created_at')
    list_filter = ('predicted_category', 'predicted_urgency', 'is_duplicate_detected')