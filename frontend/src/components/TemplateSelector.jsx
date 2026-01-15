import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, FileText } from 'lucide-react';
import { getTemplates } from '../services/api';

const defaultTemplates = [
  { id: 1, name: 'NDA', type: 'NDA', description: 'Protect confidential information',content: `
NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement ("Agreement") is entered into between the Disclosing Party and the Receiving Party.

1. PURPOSE  
The purpose of this Agreement is to prevent the unauthorized disclosure of Confidential Information.

2. CONFIDENTIAL INFORMATION  
"Confidential Information" includes all non-public, proprietary, or confidential information disclosed by the Disclosing Party.

3. OBLIGATIONS  
The Receiving Party agrees to protect the Confidential Information and not disclose it to any third party without prior written consent.

4. EXCEPTIONS  
Confidential Information does not include information that is publicly available or lawfully obtained.

5. TERM  
This Agreement shall remain in effect for five (5) years from the date of disclosure.
`, color: 'from-purple-500 to-pink-500' 
},

  { id: 2, name: 'Employment Contract', type: 'Employment', description: 'Formalize employment terms',content: `
EMPLOYMENT AGREEMENT

This Employment Agreement is entered into between the Employer and the Employee.

1. POSITION  
The Employee agrees to perform duties assigned by the Employer.

2. COMPENSATION  
The Employee shall receive compensation as agreed upon by both parties.

3. CONFIDENTIALITY  
The Employee agrees not to disclose confidential company information.

4. TERMINATION  
Either party may terminate this Agreement with written notice.

5. GOVERNING LAW  
This Agreement shall be governed by applicable laws.
`,
 color: 'from-blue-500 to-cyan-500' },

  { id: 3, name: 'Lease Agreement', type: 'Lease', description: 'Rental property agreements',content: `
LEASE AGREEMENT

This Lease Agreement is made between the Landlord and the Tenant.

1. PROPERTY  
The Landlord leases the described property to the Tenant.

2. TERM  
The lease term shall begin and end on agreed dates.

3. RENT  
The Tenant agrees to pay rent on a monthly basis.

4. MAINTENANCE  
The Tenant shall maintain the premises in good condition.

5. TERMINATION  
Failure to comply may result in termination of the lease.
`,color: 'from-green-500 to-emerald-500' },


  { id: 4, name: 'Service Agreement', type: 'Service', description: 'Service provider contracts',
    
    content: `
SERVICE AGREEMENT

This Service Agreement is entered into between the Service Provider and the Client.

1. SERVICES  
The Service Provider agrees to perform the specified services.

2. PAYMENT  
The Client agrees to pay fees as outlined in this Agreement.

3. CONFIDENTIALITY  
Both parties agree to keep information confidential.

4. LIABILITY  
Neither party shall be liable for indirect damages.

5. TERMINATION  
This Agreement may be terminated with written notice.
`,color: 'from-orange-500 to-red-500' },
];

const TemplateSelector = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const res = await getTemplates();
        if (Array.isArray(res.templates) && res.templates.length) setTemplates(res.templates);
      } catch (err) {
        console.warn('Failed to fetch templates, using defaults', err);
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

  return (
    <div className="space-y-6">
      {/* Search templates */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Templates grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="cursor-pointer transition-transform"
          >
            <div className={`relative bg-black/40 backdrop-blur-xl border rounded-2xl p-6 hover:border-white/30`}>
              <div className="text-5xl mb-4"><FileText /></div>
              <h3 className="text-white font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              <button
                onClick={() => onSelectTemplate(template)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
              >
                Select Template <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-white text-xl font-semibold">No templates found</h3>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
