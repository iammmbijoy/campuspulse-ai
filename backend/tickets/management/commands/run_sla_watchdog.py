import time
from django.core.management.base import BaseCommand
from django.utils import timezone
from tickets.models import Ticket, TicketUpdate
from ai_engine.telegram_notifier import send_telegram_alert


class Command(BaseCommand):
    help = "Scheduled SLA Watchdog: Monitors resolution deadlines and auto-escalates overdue tickets to Dept Heads."

    def add_arguments(self, parser):
        parser.add_argument(
            "--loop",
            action="store_true",
            help="Run continuously in background every 60 seconds",
        )

    def check_sla_breaches(self):
        now = timezone.now()
        overdue_tickets = Ticket.objects.filter(
            status__in=["reported", "assigned", "in_progress"],
            sla_deadline__lt=now,
        )

        escalated_count = 0
        for ticket in overdue_tickets:
            if not ticket.is_escalated:
                ticket.is_escalated = True
                ticket.save()

                tech_name = (
                    ticket.assigned_to.username if ticket.assigned_to else "Unassigned"
                )
                msg = (
                    f"[SLA WATCHDOG ESCALATION] Deadline exceeded! "
                    f"Auto-escalated to Campus Admin & Department Head (Assigned Tech: {tech_name})."
                )
                TicketUpdate.objects.create(
                    ticket=ticket,
                    updated_by=ticket.assigned_to or ticket.reporter,
                    status=ticket.status,
                    note=msg,
                )

                telegram_msg = (
                    f"🚨 <b>CAMPUSPULSE SLA ESCALATION ALERT</b>\n"
                    f"<b>Ticket #{ticket.id}:</b> {ticket.title}\n"
                    f"<b>Location:</b> {ticket.building or 'Campus'} {ticket.room_or_lab or ''}\n"
                    f"<b>Urgency:</b> {ticket.urgency.upper()}\n"
                    f"<b>Assigned Tech:</b> {tech_name}\n"
                    f"<b>Action:</b> Escalated to Department Head / Admin."
                )
                send_telegram_alert(telegram_msg)
                escalated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"[{now.strftime('%H:%M:%S')}] SLA Watchdog checked {overdue_tickets.count()} overdue tickets | Newly escalated: {escalated_count}"
            )
        )

    def handle(self, *args, **options):
        if options["loop"]:
            self.stdout.write(
                self.style.WARNING("Starting Scheduled SLA Watchdog Daemon (60s interval)...")
            )
            while True:
                self.check_sla_breaches()
                time.sleep(60)
        else:
            self.check_sla_breaches()