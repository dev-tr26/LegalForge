import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { askDocumentQuestion } from '../services/api'; // We'll create this API call

const DocumentChat = ({ document }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await askDocumentQuestion(document._id, input);
      const aiMessage = { role: 'assistant', content: res.answer || 'No answer found' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = { role: 'assistant', content: 'Error: Unable to get response' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col max-h-[420px] bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-4 text-lg">Document Chat</h3>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-4 py-2 rounded-xl max-w-[80%] break-words ${
              msg.role === 'user'
                ? 'bg-purple-500/50 text-white self-end ml-auto'
                : 'bg-gray-800/70 text-gray-100 self-start'
            }`}
          >
            {msg.content.split('\n\n').map((para, i) => (
            <p key={i} className="mb-2">{para}</p>
            ))}
          </div>
        ))}

        {loading && (
          <div className="px-4 py-2 rounded-xl max-w-[80%] bg-gray-800/50 text-gray-100 animate-pulse">
            Typing...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask something about this document..."
          className="flex-1 resize-none rounded-xl px-2 py-1 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          rows={1}
        />
        <button
          onClick={handleSend}
          className="bg-purple-500/70 hover:bg-purple-500/90 text-white rounded-xl px-4 py-2 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DocumentChat;
