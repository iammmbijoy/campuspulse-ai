from tickets.models import Ticket, TicketUpdate


def check_and_merge_duplicate(new_ticket: Ticket) -> Ticket | None:
    """
    একই বিল্ডিং, রুম এবং ক্যাটাগরিতে কোনো চলমান (unresolved) মূল টিকিট
    আছে কি না তা খুঁজে বের করে। থাকলে নতুন টিকিটটিকে মূল টিকিটের সাথে মার্জ করে।
    """
    if not new_ticket.building or not new_ticket.room_or_lab:
        return None

    # একই লোকেশন ও ক্যাটাগরির ওপেন (resolved নয় এমন) মূল টিকিট খোঁজা
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

    # নতুন টিকিটটিকে ডুপ্লিকেট হিসেবে মূল টিকিটের সাথে যুক্ত করা
    new_ticket.parent_ticket = existing_parent
    new_ticket.status = existing_parent.status
    new_ticket.save()

    # মূল টিকিটের ডুপ্লিকেট সংখ্যা বাড়ানো
    existing_parent.duplicate_count += 1

    # যদি ২ বা তার বেশি ডুপ্লিকেট রিপোর্ট আসে এবং প্রায়োরিটি কম থাকে, তবে প্রায়োরিটি বাড়িয়ে দেওয়া
    if existing_parent.duplicate_count >= 2 and existing_parent.urgency in ['low', 'medium']:
        existing_parent.urgency = 'high'

    existing_parent.save()

    # মূল টিকিটের টাইমলাইনে রেকর্ড রাখা
    TicketUpdate.objects.create(
        ticket=existing_parent,
        updated_by=new_ticket.reporter,
        status=existing_parent.status,
        note=f"Duplicate report merged from {new_ticket.reporter.username} (Total duplicates: {existing_parent.duplicate_count})."
    )

    return existing_parent