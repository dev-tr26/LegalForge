import { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Download, Eye, Edit3, Trash2, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);
  

  const sampleDocs = [
    { id: 1, name: 'Employment_Contract.pdf', status: 'completed', type: 'Contract', date: '2025-12-28', parties: ['John Doe', 'ABC Corp'] },
    { id: 2, name: 'NDA_Draft.pdf', status: 'processing', type: 'NDA', date: '2025-12-27', parties: [] },
    { id: 3, name: 'Lease_Agreement.jpg', status: 'completed', type: 'Lease', date: '2025-12-26', parties: ['Jane Smith', 'XYZ Properties'] }
  ];

  const templates = [
    { id: 1, name: 'Non-Disclosure Agreement', icon: '🔒', color: 'from-purple-500 to-pink-500' },
    { id: 2, name: 'Employment Contract', icon: '💼', color: 'from-blue-500 to-cyan-500' },
    { id: 3, name: 'Lease Agreement', icon: '🏠', color: 'from-green-500 to-emerald-500' },
    { id: 4, name: 'Service Agreement', icon: '🤝', color: 'from-orange-500 to-red-500' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        const newDoc = {
          id: Date.now(),
          name: file.name,
          status: 'processing',
          type: 'Unknown',
          date: new Date().toISOString().split('T')[0],
          parties: []
        };
        setDocuments([newDoc, ...documents]);
        setUploading(false);
        
        setTimeout(() => {
          setDocuments(prev => prev.map(d => 
            d.id === newDoc.id ? { ...d, status: 'completed', type: 'Contract', parties: ['Party A', 'Party B'] } : d
          ));
        }, 3000);
      }, 1500);
    }
  };

  const handleGenerate = (template) => {
    setProcessing(true);
    setActiveTab('editor');
    
    setTimeout(() => {
      setGeneratedDoc(`${template.name.toUpperCase()}

This ${template.name} ("Agreement") is entered into as of ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}, by and between:

PARTY A: [Legal Name]
Address: [Complete Address]

PARTY B: [Legal Name]  
Address: [Complete Address]

WHEREAS, the parties wish to enter into this agreement for the purposes described herein;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. PURPOSE
   The purpose of this Agreement is to establish the terms and conditions under which the parties will [describe purpose].

2. TERM
   This Agreement shall commence on the Effective Date and shall continue for a period of [duration], unless terminated earlier in accordance with the provisions herein.

3. OBLIGATIONS
   3.1 Party A agrees to:
       - [Obligation 1]
       - [Obligation 2]
   
   3.2 Party B agrees to:
       - [Obligation 1]
       - [Obligation 2]

4. CONFIDENTIALITY
   Both parties agree to maintain confidentiality of all proprietary information disclosed during the term of this Agreement.

5. TERMINATION
   Either party may terminate this Agreement with [number] days written notice to the other party.

6. GOVERNING LAW
   This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________          _________________________
Party A Signature                  Party B Signature
Date: _______________              Date: _______________`);
      setProcessing(false);
      setEditMode(true);
    }, 2000);
  };

  // NEW: Handle upload success
  const handleUploadSuccess = (result) => {
    alert('Document uploaded successfully!');
    setActiveTab('documents');
  };

  // NEW: Handle view document
  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setGeneratedDoc(doc.generated_document || doc.ocr_text || '');
    setActiveTab('editor');
  };

  // NEW: Handle save document
  const handleSaveDocument = async (content) => {
    if (!selectedDoc) return;
    try {
      await updateDocument(selectedDoc._id, { generated_document: content });
      alert('Document saved!');
    } catch (error) {
      alert('Save failed');
    }
  };

  // NEW: Handle delete success
  const handleDeleteSuccess = (docId) => {
    if (selectedDoc && selectedDoc._id === docId) {
      setSelectedDoc(null);
      setActiveTab('documents');
    }
  };

  // NEW: Handle download
  const handleDownload = (doc) => {
    const content = doc.generated_document || doc.ocr_text || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name || 'document.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const StatusBadge = ({ status }) => {
    const config = {
      completed: { icon: CheckCircle, text: 'Completed', bg: 'bg-green-500/10', text2: 'text-green-400', border: 'border-green-500/20' },
      processing: { icon: Clock, text: 'Processing', bg: 'bg-yellow-500/10', text2: 'text-yellow-400', border: 'border-yellow-500/20' },
      failed: { icon: AlertCircle, text: 'Failed', bg: 'bg-red-500/10', text2: 'text-red-400', border: 'border-red-500/20' }
    };
    const { icon: Icon, text, bg, text2, border } = config[status] || config.completed;
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${bg} ${border}`}>
        <Icon className={`w-4 h-4 ${text2}`} />
        <span className={`text-sm font-medium ${text2}`}>{text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">LegalForge AI</h1>
                  <p className="text-sm text-purple-300">Intelligent Document Processing</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
                  Documentation
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium shadow-lg shadow-purple-500/50 transition-all">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-fit">
            {[
              { id: 'upload', label: 'Upload & Process', icon: Upload },
              { id: 'templates', label: 'Templates', icon: Sparkles },
              { id: 'documents', label: 'My Documents', icon: FileText },
              { id: 'editor', label: 'Editor', icon: Edit3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border-2 border-dashed border-white/20 rounded-2xl p-16 text-center hover:border-purple-500/50 transition-all">
                  <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-white mb-2">Drop your documents here</h3>
                  <p className="text-gray-400 mb-6">or click to browse • PDF, JPG, PNG supported</p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium shadow-lg shadow-purple-500/50">
                    <Upload className="w-5 h-5" />
                    Choose File
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {uploading && (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">Uploading document...</h4>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: '🔍', title: 'Smart OCR', desc: 'Extract text with 99% accuracy using PaddleOCR' },
                  { icon: '🤖', title: 'AI Analysis', desc: 'Grok AI extracts parties, dates, and clauses' },
                  { icon: '📄', title: 'Generate Docs', desc: 'Create legal documents in seconds' }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleGenerate(template)}
                  className="group cursor-pointer relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${template.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{template.icon}</div>
                    <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                    <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                      Generate <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {sampleDocs.map(doc => (
                <div key={doc.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{doc.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.date}</span>
                          {doc.parties.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{doc.parties.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={doc.status} />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDownload(doc)}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm('Delete this document?')) {
                              setDocuments(prev => prev.filter(d => d.id !== doc.id));
                            }
                          }}
                          className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Editor Tab */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {processing ? (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 animate-spin flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">Generating your document...</h3>
                  <p className="text-gray-400">AI is crafting the perfect legal document</p>
                </div>
              ) : generatedDoc ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Document Editor</h2>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const blob = new Blob([generatedDoc], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'document.txt';
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                      
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
                        <Download className="w-4 h-4" />
                        Export PDF
                      </button>
                      <button 
                        onClick={() => alert('Document saved!')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium shadow-lg shadow-purple-500/50">
                        <CheckCircle className="w-4 h-4" />
                        Save Document
                      </button>
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <textarea
                      value={generatedDoc}
                      onChange={(e) => setGeneratedDoc(e.target.value)}
                      className="w-full h-96 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
                      placeholder="Your document will appear here..."
                    />
                  </div>
                </>
              ) : (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
                  <Edit3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">No document to edit</h3>
                  <p className="text-gray-400 mb-6">Generate a document from templates or upload one to get started</p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium shadow-lg shadow-purple-500/50"
                  >
                    Browse Templates
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;