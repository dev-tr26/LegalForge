import { useState, useEffect, useCallback } from 'react';
import { FileText, Eye, Download, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getDocuments, deleteDocument } from '../services/api';

const DocumentList = ({ userId = 'anonymous', onViewDocument, onDeleteSuccess }) => {
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

  const handleView = (doc) => {
    if (onViewDocument) {
      onViewDocument(doc);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const content = doc.generated_document || doc.ocr_text || '';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename || 'document.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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
      if (onDeleteSuccess) {
        onDeleteSuccess(docId);
      }
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
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-white text-xl font-semibold mb-2">No documents yet</h3>
        <p className="text-gray-400">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold mb-1 truncate">{doc.filename}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{doc.type || 'Unknown'}</span>
                  <span>•</span>
                  <span>{doc.date || new Date(doc.upload_date).toLocaleDateString()}</span>
                  {doc.structured_data?.parties?.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="truncate">{doc.structured_data.parties.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={doc.status} />
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(doc)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                  title="View document"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                  title="Download document"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
                  disabled={deleting === doc._id}
                  className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-all disabled:opacity-50"
                  title="Delete document"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;