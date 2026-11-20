from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from tickets.models import Ticket, TicketUpdate

User = get_user_model()

SLA_HOURS = {
    'critical': 1,
    'high': 4,
    'medium': 24,
    'low': 48,
}


def calculate_sla_deadline(urgency: str):
    """Calculates the SLA resolution deadline based on ticket urgency."""
    hours = SLA_HOURS.get(urgency, 24)
    return timezone.now() + timedelta(hours=hours)


def auto_assign_technician(ticket: Ticket) -> str:
    """
    Automatically assigns the best available on-duty technician based on
    matching specialization and lowest active ticket workload.
    """
    # 1. Search for on-duty technicians matching the ticket category
    candidates = User.objects.filter(
        role='technician',
        is_on_duty=True,
        specialization=ticket.category
    ).annotate(
        active_load=Count(
            'assigned_tickets',
            filter=Q(assigned_tickets__status__in=['assigned', 'in_progress', 'escalated'])
        )
    ).order_by('active_load', 'id')

    # 2. Fallback to any on-duty technician if no specialist is currently available
    if not candidates.exists():
        candidates = User.objects.filter(
            role='technician',
            is_on_duty=True
        ).annotate(
            active_load=Count(
                'assigned_tickets',
                filter=Q(assigned_tickets__status__in=['assigned', 'in_progress', 'escalated'])
            )
        ).order_by('active_load', 'id')

    best_tech = candidates.first()

    if best_tech:
        ticket.assigned_to = best_tech
        ticket.status = 'assigned'
        ticket.save()

        reason = (
            f"Auto-assigned to {best_tech.username} "
            f"(Specialization: {best_tech.get_specialization_display()}, "
            f"Active workload: {best_tech.active_load} tickets)."
        )

        TicketUpdate.objects.create(
            ticket=ticket,
            updated_by=None,
            status='assigned',
            note=reason
        )
        return reason

    return "No on-duty technician available right now; ticket remains in reported queue."