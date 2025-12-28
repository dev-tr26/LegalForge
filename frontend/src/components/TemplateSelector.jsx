import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Sparkles } from 'lucide-react';
import { getTemplates } from '../services/api';

const TemplateSelector = ({ onSelectTemplate, onGenerate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Default templates if API fails
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.templates || defaultTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates(defaultTemplates);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleGenerate = () => {
    if (selectedTemplate && onGenerate) {
      onGenerate(selectedTemplate);
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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
        />
      </div>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${selectedTemplate.color} rounded-xl flex items-center justify-center text-3xl`}>
                {selectedTemplate.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedTemplate.name}</h3>
                <p className="text-gray-400 text-sm">{selectedTemplate.description}</p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium shadow-lg shadow-purple-500/50 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Generate Document
            </button>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={`group cursor-pointer relative transition-all ${
              selectedTemplate?.id === template.id ? 'scale-105' : ''
            }`}
          >
            <div className={`
              absolute inset-0 bg-gradient-to-r ${template.color} rounded-2xl blur-xl transition-opacity
              ${selectedTemplate?.id === template.id ? 'opacity-75' : 'opacity-50 group-hover:opacity-75'}
            `}></div>
            
            <div className={`
              relative bg-black/40 backdrop-blur-xl border rounded-2xl p-6 transition-all
              ${selectedTemplate?.id === template.id 
                ? 'border-white/50 shadow-2xl' 
                : 'border-white/10 hover:border-white/30'
              }
            `}>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {template.icon}
              </div>
              
              <h3 className="text-white font-semibold mb-2 line-clamp-2">
                {template.name}
              </h3>
              
              {template.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                Select <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-white text-xl font-semibold mb-2">No templates found</h3>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;