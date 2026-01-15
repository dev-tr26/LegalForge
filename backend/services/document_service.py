from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(self):
        try:
            # Add connection timeout and server selection timeout
            mongodb_uri = getattr(settings, 'MONGODB_URI', 'mongodb://localhost:27017/')
            
            self.client = MongoClient(
                mongodb_uri,
                serverSelectionTimeoutMS=5000,  # 5 second timeout
                connectTimeoutMS=5000,
                socketTimeoutMS=5000
            )
            
            # Test connection
            self.client.admin.command('ping')
            
            mongodb_name = getattr(settings, 'MONGODB_NAME', 'legal_docs')
            self.db = self.client[mongodb_name]
            self.documents = self.db['documents']
            self.templates = self.db['templates']
            
            logger.info(f"MongoDB connection established to {mongodb_uri}")
        except Exception as e:
            logger.error(f"MongoDB connection failed: {str(e)}")
            logger.error(f"Attempted connection to: {getattr(settings, 'MONGODB_URI', 'NOT SET')}")
            raise

    def save_document(self, document_data: dict) -> str:
        """Save new document to MongoDB"""
        try:
            document_data['upload_date'] = datetime.utcnow()
            result = self.documents.insert_one(document_data)
            logger.info(f"Document saved with ID: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error saving document: {str(e)}")
            raise

    def update_document(self, doc_id: str, updates: dict) -> bool:
        """Update existing document"""
        try:
            result = self.documents.update_one(
                {'_id': ObjectId(doc_id)},
                {'$set': updates}
            )
            logger.info(f"Document {doc_id} updated: {result.modified_count} documents")
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating document: {str(e)}")
            raise

    def get_document(self, doc_id: str) -> dict:
        """Get document by ID"""
        try:
            document = self.documents.find_one({'_id': ObjectId(doc_id)})
            return document
        except Exception as e:
            logger.error(f"Error getting document: {str(e)}")
            raise

    def get_all_documents(self, user_id: str = None) -> list:
        """Get all documents, optionally filtered by user"""
        try:
            query = {'user_id': user_id} if user_id else {}
            documents = list(self.documents.find(query).sort('upload_date', -1))
            return documents
        except Exception as e:
            logger.error(f"Error getting documents: {str(e)}")
            raise

    def delete_document(self, doc_id: str) -> bool:
        """Delete document by ID"""
        try:
            result = self.documents.delete_one({'_id': ObjectId(doc_id)})
            logger.info(f"Document {doc_id} deleted: {result.deleted_count} documents")
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            raise