from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.conf import settings
import os
import json
import logging
from threading import Thread
from bson import ObjectId

from services.ocr_service import OCRService
from services.llm_service import LLMService
from services.document_service import DocumentService

from django.shortcuts import get_object_or_404
 

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    def get(self, request):
        return Response({'status': 'healthy', 'service': 'Legal Document Generator API'})


class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            file = request.FILES.get('file')
            user_id = request.data.get('user_id', 'anonymous')

            if not file:
                return Response(
                    {'error': 'No file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate file type
            allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
            file_extension = os.path.splitext(file.name)[1].lower()
            if file_extension not in allowed_extensions:
                return Response(
                    {'error': f'File type not allowed. Allowed: {", ".join(allowed_extensions)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save file
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            file_path = os.path.join(upload_dir, file.name)
            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            # Save to MongoDB
            doc_service = DocumentService()
            doc_id = doc_service.save_document({
                'user_id': user_id,
                'filename': file.name,
                'file_type': 'pdf' if file_extension == '.pdf' else 'image',
                'status': 'processing',
                'file_path': file_path
            })

            # Process document asynchronously
            thread = Thread(target=self.process_document, args=(doc_id, file_path))
            thread.start()

            return Response({
                'document_id': doc_id,
                'filename': file.name,
                'status': 'processing',
                'message': 'Document uploaded and processing started'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Upload error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_document(self, doc_id, file_path):
        """Process document with OCR and LLM"""
        try:
            ocr_service = OCRService()
            llm_service = LLMService()
            doc_service = DocumentService()

            # Extract text
            logger.info(f"Starting OCR for document {doc_id}")
            if file_path.endswith('.pdf'):
                ocr_text = ocr_service.extract_text_from_pdf(file_path)
            else:
                ocr_text = ocr_service.extract_text_from_image(file_path)

            # Extract structured data
            logger.info(f"Starting LLM analysis for document {doc_id}")
            structured_data_raw = llm_service.extract_structured_data(ocr_text)
            
            try:
                structured_data = json.loads(structured_data_raw)
            except json.JSONDecodeError:
                structured_data = {
                    'parties': [],
                    'dates': [],
                    'clauses': [],
                    'document_type': 'Unknown'
                }

            # Update document
            doc_service.update_document(doc_id, {
                'ocr_text': ocr_text,
                'structured_data': structured_data,
                'status': 'completed'
            })

            logger.info(f"Document {doc_id} processed successfully")

        except Exception as e:
            logger.error(f"Processing error for document {doc_id}: {str(e)}")
            doc_service = DocumentService()
            doc_service.update_document(doc_id, {
                'status': 'failed',
                'error': str(e)
            })


class DocumentListView(APIView):
    def get(self, request):
        try:
            user_id = request.query_params.get('user_id', 'anonymous')
            doc_service = DocumentService()
            documents = doc_service.get_all_documents(user_id)

            # Convert ObjectId to string
            for doc in documents:
                doc['_id'] = str(doc['_id'])
                if 'upload_date' in doc:
                    doc['upload_date'] = doc['upload_date'].isoformat()

            return Response({
                'count': len(documents),
                'documents': documents
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"List documents error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DocumentDetailView(APIView):
    def get(self, request, doc_id):
        try:
            doc_service = DocumentService()
            document = doc_service.get_document(doc_id)

            if not document:
                return Response(
                    {'error': 'Document not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            document['_id'] = str(document['_id'])
            if 'upload_date' in document:
                document['upload_date'] = document['upload_date'].isoformat()

            return Response(document, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Get document error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, doc_id):
        """Update document"""
        try:
            doc_service = DocumentService()
            document = doc_service.get_document(doc_id)

            if not document:
                return Response(
                    {'error': 'Document not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Update document with provided data
            update_data = request.data
            doc_service.update_document(doc_id, update_data)

            return Response(
                {'message': 'Document updated successfully'},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Update document error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, doc_id):
        """Delete document"""
        try:
            doc_service = DocumentService()
            document = doc_service.get_document(doc_id)

            if not document:
                return Response(
                    {'error': 'Document not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Delete file
            if 'file_path' in document and os.path.exists(document['file_path']):
                try:
                    os.remove(document['file_path'])
                    logger.info(f"Deleted file: {document['file_path']}")
                except Exception as e:
                    logger.warning(f"Could not delete file: {str(e)}")

            # Delete from database
            deleted = doc_service.delete_document(doc_id)
            
            if deleted:
                logger.info(f"Document {doc_id} deleted successfully")
                return Response(
                    {'message': 'Document deleted successfully'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'error': 'Document could not be deleted'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.error(f"Delete document error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DocumentGenerateView(APIView):
    def post(self, request):
        try:
            doc_id = request.data.get('document_id')
            template_type = request.data.get('template_type', 'Contract')
            user_prompt = request.data.get('prompt', '')

            if not doc_id:
                return Response(
                    {'error': 'document_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            doc_service = DocumentService()
            llm_service = LLMService()

            # Get document
            document = doc_service.get_document(doc_id)
            if not document:
                return Response(
                    {'error': 'Document not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            structured_data = document.get('structured_data', {})

            # Generate document
            logger.info(f"Generating {template_type} for document {doc_id}")
            generated_doc = llm_service.generate_document(
                template_type,
                json.dumps(structured_data),
                user_prompt
            )

            # Update document
            doc_service.update_document(doc_id, {
                'generated_document': generated_doc,
                'template_type': template_type
            })

            return Response({
                'document': generated_doc,
                'template_type': template_type
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Generate document error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TemplateListView(APIView):
    def get(self, request):
        templates = [
            {
                'id': 1,
                'name': 'Non-Disclosure Agreement',
                'type': 'NDA',
                'description': 'Protect confidential information',
                'color': 'from-purple-500 to-pink-500'
            },
            {
                'id': 2,
                'name': 'Employment Contract',
                'type': 'Employment',
                'description': 'Formalize employment terms',
                'color': 'from-blue-500 to-cyan-500'
            },
            {
                'id': 3,
                'name': 'Lease Agreement',
                'type': 'Lease',
                'description': 'Rental property agreements',
                'color': 'from-green-500 to-emerald-500'
            },
            {
                'id': 4,
                'name': 'Service Agreement',
                'type': 'Service',
                'description': 'Service provider contracts',
                'color': 'from-orange-500 to-red-500'
            }
        ]
        return Response({'templates': templates}, status=status.HTTP_200_OK)
    
    
    
class DocumentAskView(APIView):
    def post(self, request, doc_id):
        """
        Ask a question about a specific document.
        """
        question = request.data.get("question")
        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)

        doc_service = DocumentService()
        llm_service = LLMService()

        # Fetch document from MongoDB
        document = doc_service.get_document(doc_id)
        if not document:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        ocr_text = document.get("ocr_text", "")
        if not ocr_text:
            return Response({"error": "Document has no OCR text"}, status=status.HTTP_400_BAD_REQUEST)

        # Ask question using LLM
        try:
            answer = llm_service.ask_question(ocr_text, question)
            return Response({"answer": answer}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error answering question for document {doc_id}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
