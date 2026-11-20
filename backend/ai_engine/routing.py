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
    """Urgency অনুযায়ী সমাধানের সময়সীমা (SLA Deadline) হিসাব করে"""
    hours = SLA_HOURS.get(urgency, 24)
    return timezone.now() + timedelta(hours=hours)


def auto_assign_technician(ticket: Ticket) -> str:
    """
    সমস্যার ক্যাটাগরি ও বর্তমান কাজের চাপ (active ticket count) দেখে
    সেরা On-Duty টেকনিশিয়ানকে স্বয়ংক্রিয়ভাবে অ্যাসাইন করে।
    """
    # ১. একই specialization ও অন-ডিউটি টেকনিশিয়ানদের কাজের চাপসহ খোঁজা
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

    # ২. ওই নির্দিষ্ট বিভাগের কেউ না থাকলে যেকোনো অন-ডিউটি টেকনিশিয়ান খোঁজা
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