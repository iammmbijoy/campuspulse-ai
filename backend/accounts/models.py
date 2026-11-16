from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('technician', 'Technician'),
        ('admin', 'Campus Admin / Dept Head'),
    )

    SPECIALIZATION_CHOICES = (
        ('general', 'General Maintenance'),
        ('it', 'IT & Network'),
        ('electrical', 'Electrical & AC'),
        ('plumbing', 'Plumbing & Water'),
        ('lab_equipment', 'Lab Equipment'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    department = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    telegram_chat_id = models.CharField(max_length=50, blank=True, null=True)

    # Technician-specific fields
    specialization = models.CharField(
        max_length=30,
        choices=SPECIALIZATION_CHOICES,
        default='general'
    )
    is_on_duty = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"