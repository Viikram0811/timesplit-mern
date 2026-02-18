import { useEffect, useState, useRef } from 'react';
import Layout from '../components/common/Layout';
import chatService from '../services/chatService';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const response = await chatService.getChatHistory();
      setMessages(response.messages || []);
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message immediately
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await chatService.sendMessage(userMessage);
      setMessages(response.chatHistory);
      
      // Check if response indicates rate limit
      if (response.response && response.response.includes('Rate limit')) {
        toast.error('Rate limit reached. Please wait a moment before sending another message.');
      }
    } catch (error) {
      // Better error handling
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      
      if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
        toast.error('⚠️ Rate limit reached. Please wait a moment and try again.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
      
      // Remove user message on error
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      try {
        await chatService.clearChatHistory();
        setMessages([]);
        toast.success('Chat history cleared');
      } catch (error) {
        toast.error('Failed to clear chat history');
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-base-content">AI Chatbot</h1>
          <button
            onClick={handleClear}
            className="btn btn-ghost"
          >
            Clear History
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl flex-1 flex flex-col">
          {/* Messages */}
          <div className="card-body flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-base-content/70 py-12">
                <p className="text-lg mb-2">👋 Hello! I'm your AI study assistant.</p>
                <p>Ask me anything about your studies, schedule, or academic goals!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
                  >
                    <div className={`chat-bubble ${
                      message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-base-300'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {loading && (
              <div className="chat chat-start">
                <div className="chat-bubble chat-bubble-base-300">
                  <span className="loading loading-dots loading-md"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="card-body border-t border-base-300 pt-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="input input-bordered flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chatbot;
