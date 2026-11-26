from django.urls import path
from .views import TicketListCreateView, TicketDetailView, TicketStatusUpdateView, TicketFeedbackView

urlpatterns = [
    path('', TicketListCreateView.as_view(), name='ticket_list_create'),
    path('<int:pk>/', TicketDetailView.as_view(), name='ticket_detail'),
    path('<int:pk>/update-status/', TicketStatusUpdateView.as_view(), name='ticket_update_status'),
    path('<int:pk>/feedback/', TicketFeedbackView.as_view(), name='ticket_feedback'),
]