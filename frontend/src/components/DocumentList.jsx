import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Eye, Download, Trash2, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getDocuments, deleteDocument } from '../services/api';

const DocumentList = ({
  userId = 'anonymous',
  onViewDocument,
  onDeleteSuccess,
  onCreateFromTemplate
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDocuments(userId);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleView = (doc) => onViewDocument?.(doc);

  const handleDownload = async (doc) => {
    try {
      const content = doc.generated_document || doc.ocr_text || '';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.filename || 'document.txt';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setDeleting(docId);
      await deleteDocument(docId);
      setDocuments(docs => docs.filter(d => d._id !== docId));
      onDeleteSuccess?.(docId);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Create New Legal Document</h3>
            <p className="text-gray-300 text-sm">
              Start with a professional template or upload your own document
            </p>
          </div>
          <button
            onClick={onCreateFromTemplate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Create from Template
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">No documents yet</h3>
          <p className="text-gray-400 mb-4">
            Upload your first document or create one from a template
          </p>
          <button
            onClick={onCreateFromTemplate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Create from Template
          </button>
        </div>
      ) : (
        documents.map(doc => (
          <div
            key={doc._id}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{doc.filename}</h3>
                  <p className="text-sm text-gray-400">
                    {doc.type || 'Unknown'} •{' '}
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleView(doc)}><Eye /></button>
                <button onClick={() => handleDownload(doc)}><Download /></button>
                <button onClick={() => handleDelete(doc._id)} disabled={deleting === doc._id}>
                  <Trash2 />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentList;
