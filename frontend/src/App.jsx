import { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, Edit3, ChevronRight } from 'lucide-react';
import DocumentList from './components/DocumentList';
import DocumentUploader from './components/DocumentUploader';
import DocumentEditor from './components/DocumentEditor';
import TemplateSelector from './components/TemplateSelector';
import { getTemplates, generateDocument, updateDocument } from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [templates, setTemplates] = useState([]);

  // Fetch templates once
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getTemplates();
        setTemplates(res.templates || []);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const refreshDocuments = async () => {
    try {
      setSelectedDoc(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSuccess = () => {
    setActiveTab('documents');
    refreshDocuments();
  };

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setGeneratedDoc(doc.generated_document || doc.ocr_text || '');
    setActiveTab('editor');
  };

  const handleSaveDocument = async (content) => {
    if (!selectedDoc) return;
    try {
      await updateDocument(selectedDoc._id, { generated_document: content });
      alert('Document saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save document');
    }
  };

  const handleGenerate = async (template) => {
    if (!selectedDoc) return alert('Select a document first');
    setActiveTab('editor');
    try {
      const res = await generateDocument(selectedDoc._id, template.type, '');
      setGeneratedDoc(res.document || '');
      setSelectedDoc({ ...selectedDoc, generated_document: res.document });
    } catch (err) {
      console.error(err);
      alert('Failed to generate document');
    }
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
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">LegalForge AI</h1>
                <p className="text-sm text-purple-300">Intelligent Document Processing</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-8">
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

          {/* Tab Contents */}
          {activeTab === 'upload' && (
            <DocumentUploader onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'documents' && (
            <DocumentList
              onViewDocument={handleViewDocument}
              onDeleteSuccess={() => setSelectedDoc(null)}
            />
          )}

          {activeTab === 'templates' && (
            // <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            //   {templates.map(template => (
            //     <div
            //       key={template.id}
            //       onClick={() => handleGenerate(template)}
            //       className="group cursor-pointer relative"
            //     >
            //       <div className={`absolute inset-0 bg-gradient-to-r ${template.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
            //       <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
            //         <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{template.icon}</div>
            //         <h3 className="text-white font-semibold mb-2">{template.name}</h3>
            //         <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
            //           Generate <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            //         </div>
            //       </div>
            //     </div>
            //   ))}
            // </div>
            <DocumentEditor
              document={selectedDoc ? { ...selectedDoc, generated_document: generatedDoc} : null}
              onSave={handleSaveDocument}
            />
            )}

          {activeTab === 'editor' && (
            <DocumentEditor
              document={selectedDoc ? { ...selectedDoc, generated_document: generatedDoc } : null}
              onSave={handleSaveDocument}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;