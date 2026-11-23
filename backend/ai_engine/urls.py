from django.urls import path
from .views import AIDecisionLogListView

urlpatterns = [
    path('logs/', AIDecisionLogListView.as_view(), name='ai_decision_logs'),
]