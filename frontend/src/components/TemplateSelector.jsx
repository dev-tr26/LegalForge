import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Sparkles } from 'lucide-react';
import { getTemplates } from '../services/api';

// Default templates (defined once)
const defaultTemplates = [
  {
    id: 1,
    name: 'Non-Disclosure Agreement',
    type: 'NDA',
    icon: '🔒',
    color: 'from-purple-500 to-pink-500',
    description: 'Protect confidential information and trade secrets'
  },
  {
    id: 2,
    name: 'Employment Contract',
    type: 'Employment',
    icon: '💼',
    color: 'from-blue-500 to-cyan-500',
    description: 'Formal employment terms and conditions'
  },
  {
    id: 3,
    name: 'Lease Agreement',
    type: 'Lease',
    icon: '🏠',
    color: 'from-green-500 to-emerald-500',
    description: 'Residential or commercial property rental'
  },
  {
    id: 4,
    name: 'Service Agreement',
    type: 'Service',
    icon: '🤝',
    color: 'from-orange-500 to-red-500',
    description: 'Service provider and client contracts'
  },
  {
    id: 5,
    name: 'Partnership Agreement',
    type: 'Partnership',
    icon: '👥',
    color: 'from-indigo-500 to-purple-500',
    description: 'Business partnership terms and profit sharing'
  },
  {
    id: 6,
    name: 'Consulting Agreement',
    type: 'Consulting',
    icon: '💡',
    color: 'from-yellow-500 to-orange-500',
    description: 'Independent contractor consulting services'
  },
  {
    id: 7,
    name: 'Purchase Agreement',
    type: 'Purchase',
    icon: '🛒',
    color: 'from-pink-500 to-rose-500',
    description: 'Buying and selling goods or services'
  },
  {
    id: 8,
    name: 'License Agreement',
    type: 'License',
    icon: '📜',
    color: 'from-teal-500 to-cyan-500',
    description: 'Software or intellectual property licensing'
  }
];

const TemplateSelector = ({ onSelectTemplate, onGenerate }) => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        console.log('🔍 Fetching templates from API...');
        setLoading(true);

        const response = await getTemplates();
        console.log('✅ API response:', response);

        if (Array.isArray(response?.templates) && response.templates.length > 0) {
          setTemplates(response.templates);
        } else {
          console.warn('⚠️ API returned no templates, using defaults');
        }
      } catch (error) {
        console.error('❌ Failed to fetch templates, using defaults:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template);
  };

  const handleGenerate = () => {
    if (selectedTemplate) {
      onGenerate?.(selectedTemplate);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-spin flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Selected Template */}
      {selectedTemplate && (
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${selectedTemplate.color} rounded-xl flex items-center justify-center text-3xl`}>
                {selectedTemplate.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                <p className="text-gray-400 text-sm">{selectedTemplate.description}</p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:opacity-90"
            >
              <Sparkles className="w-5 h-5" />
              Generate Document
            </button>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={`cursor-pointer transition-transform ${
              selectedTemplate?.id === template.id ? 'scale-105' : ''
            }`}
          >
            <div className={`relative bg-black/40 backdrop-blur-xl border rounded-2xl p-6 ${
              selectedTemplate?.id === template.id
                ? 'border-white/50'
                : 'border-white/10 hover:border-white/30'
            }`}>
              <div className="text-5xl mb-4">{template.icon}</div>
              <h3 className="text-white font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                Select <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-white text-xl font-semibold">No templates found</h3>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
