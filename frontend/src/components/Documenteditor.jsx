import React, { useState, useEffect } from 'react';
import { Download, Save, CheckCircle, Edit3, FileText, Copy, Printer } from 'lucide-react';

const DocumentEditor = ({ document, onSave }) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (document && document.generated_document) {
      setContent(document.generated_document);
    } else if (document && document.ocr_text) {
      setContent(document.ocr_text);
    }
  }, [document]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
    }
    setSaving(false);
  };

  const handleDownloadPDF = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document?.filename || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Document</title>');
    printWindow.document.write('<style>body { font-family: monospace; white-space: pre-wrap; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  if (!document) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
        <Edit3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-white text-xl font-semibold mb-2">No document selected</h3>
        <p className="text-gray-400">Select a document to edit or generate a new one</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Document Editor</h2>
            <p className="text-sm text-gray-400">{document.filename}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium shadow-lg transition-all ${
              saveSuccess
                ? 'bg-green-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/50'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Document'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Lines: {content.split('\n').length}</span>
            <span>•</span>
            <span>Characters: {content.length}</span>
            <span>•</span>
            <span>Words: {content.split(/\s+/).filter(Boolean).length}</span>
          </div>
          <div className="text-sm text-gray-400">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Auto-saved
          </div>
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[600px] bg-transparent text-white font-mono text-sm p-6 resize-none focus:outline-none"
          placeholder="Your document content will appear here..."
        />
      </div>

      {/* Footer Info */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-semibold">Type:</span>
            <span>{document.type || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-semibold">Status:</span>
            <span>{document.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-semibold">Date:</span>
            <span>{document.date || new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;