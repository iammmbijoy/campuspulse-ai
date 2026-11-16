from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'department', 'specialization', 'is_on_duty')
    list_filter = ('role', 'specialization', 'is_on_duty')
    fieldsets = UserAdmin.fieldsets + (
        ('CampusPulse Role & Info', {
            'fields': ('role', 'department', 'phone', 'telegram_chat_id', 'specialization', 'is_on_duty')
        }),
    )