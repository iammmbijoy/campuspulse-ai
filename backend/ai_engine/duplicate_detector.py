from tickets.models import Ticket, TicketUpdate


def check_and_merge_duplicate(new_ticket: Ticket) -> Ticket | None:
    """
    Checks if an unresolved parent ticket already exists for the same building,
    room/lab, and category. If found, merges the new ticket into the parent ticket.
    """
    if not new_ticket.building or not new_ticket.room_or_lab:
        return None

    # Find the earliest open (unresolved) parent ticket in the same location and category
    existing_parent = Ticket.objects.filter(
        parent_ticket__isnull=True,
        category=new_ticket.category,
        building__iexact=new_ticket.building.strip(),
        room_or_lab__iexact=new_ticket.room_or_lab.strip(),
    ).exclude(
        id=new_ticket.id
    ).exclude(
        status='resolved'
    ).order_by('created_at').first()

    if not existing_parent:
        return None

    # Link the new ticket as a duplicate child of the existing parent ticket
    new_ticket.parent_ticket = existing_parent
    new_ticket.status = existing_parent.status
    new_ticket.save()

    # Increment duplicate report count on the parent ticket
    existing_parent.duplicate_count += 1

    # Escalate urgency to 'high' if 2 or more duplicate reports are received
    if existing_parent.duplicate_count >= 2 and existing_parent.urgency in ['low', 'medium']:
        existing_parent.urgency = 'high'

    existing_parent.save()

    # Log the duplicate merge in the parent ticket's timeline
    TicketUpdate.objects.create(
        ticket=existing_parent,
        updated_by=new_ticket.reporter,
        status=existing_parent.status,
        note=f"Duplicate report merged from {new_ticket.reporter.username} (Total duplicates: {existing_parent.duplicate_count})."
    )

    return existing_parent