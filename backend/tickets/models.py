from django.db import models
from django.conf import settings


class Ticket(models.Model):
    CATEGORY_CHOICES = (
        ('general', 'General Maintenance'),
        ('it', 'IT & Network'),
        ('electrical', 'Electrical & AC'),
        ('plumbing', 'Plumbing & Water'),
        ('lab_equipment', 'Lab Equipment'),
    )

    URGENCY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    STATUS_CHOICES = (
        ('reported', 'Reported'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('escalated', 'Escalated'),
    )

    # Reporter details and incident description
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reported_tickets'
    )
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField()  # Incident report in Bengali, English, or Banglish
    image = models.ImageField(upload_to='tickets/issues/', blank=True, null=True)

    # AI-extracted metadata (Multimodal Triage)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='general')
    building = models.CharField(max_length=100, blank=True, null=True)
    room_or_lab = models.CharField(max_length=100, blank=True, null=True)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    ai_confidence = models.FloatField(default=0.0)
    ai_checklist = models.JSONField(default=list, blank=True)  # Step-by-step troubleshooting checklist

    # Smart Duplicate Merging
    parent_ticket = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='duplicate_tickets'
    )
    duplicate_count = models.PositiveIntegerField(default=0)

    # Assignment, status, and SLA tracking
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    sla_deadline = models.DateTimeField(null=True, blank=True)
    is_escalated = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"#{self.id} - {self.title or self.description[:30]} ({self.status})"


class TicketUpdate(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20)
    note = models.TextField(blank=True)
    proof_image = models.ImageField(upload_to='tickets/proofs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ticket #{self.ticket.id} -> {self.status}"


class TicketFeedback(models.Model):
    ticket = models.OneToOneField(Ticket, on_delete=models.CASCADE, related_name='feedback')
    rating = models.PositiveSmallIntegerField()  # Rating from 1 to 5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for #{self.ticket.id}: {self.rating}/5"