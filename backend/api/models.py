from django.db import models

# Create your models here.

class Document(models.Model):
    file = models.FileField(upload_to="documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    ocr_text = models.TextField(blank=True)
    structured_data = models.JSONField(blank=True, null=True)
    risks = models.JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"Document {self.id} - {self.file.name}"