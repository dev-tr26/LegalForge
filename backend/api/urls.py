from django.urls import path
from .views import (
    DocumentUploadView,
    DocumentListView,
    DocumentDetailView,
    DocumentGenerateView,
    # DocumentDeleteView,
    TemplateListView,
    HealthCheckView
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('', DocumentUploadView.as_view(), name='document-upload'),
    path('documents/', DocumentListView.as_view(), name='document-list'),
    path('documents/<str:doc_id>/', DocumentDetailView.as_view(), name='document-detail'),
    # path('api/documents/<str:doc_id>/delete/', DocumentDeleteView.as_view(), name='document-delete'),
    path('generate/', DocumentGenerateView.as_view(), name='document-generate'),
    path('templates/', TemplateListView.as_view(), name='template-list'),
]

