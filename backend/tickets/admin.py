from django.contrib import admin
from .models import Ticket, TicketUpdate, TicketFeedback


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'urgency', 'status', 'building', 'room_or_lab', 'assigned_to', 'created_at')
    list_filter = ('category', 'urgency', 'status', 'is_escalated')
    search_fields = ('title', 'description', 'building', 'room_or_lab')


@admin.register(TicketUpdate)
class TicketUpdateAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'status', 'updated_by', 'created_at')


@admin.register(TicketFeedback)
class TicketFeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'rating', 'created_at')