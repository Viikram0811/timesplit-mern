import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/common/Layout';
import chatService from '../services/chatService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  const userInitial = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return 'U';
    return name[0]?.toUpperCase() || 'U';
  }, [user?.name]);

  const aiInitial = 'TS';

  const loadHistory = async () => {
    try {
      const response = await chatService.getChatHistory();
      setMessages(response.messages || []);
      requestAnimationFrame(() => scrollToBottom('auto'));
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
    requestAnimationFrame(() => scrollToBottom('smooth'));

    try {
      const response = await chatService.sendMessage(userMessage);
      setMessages(response.chatHistory);
      requestAnimationFrame(() => scrollToBottom('smooth'));
      
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
        requestAnimationFrame(() => scrollToBottom('auto'));
      } catch (error) {
        toast.error('Failed to clear chat history');
      }
    }
  };

  return (
    <Layout scroll={false}>
      <div className="h-full flex flex-col">
        <div className="card bg-base-100 shadow-xl flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-4 border-b border-base-300">
            <div className="flex items-center gap-3 min-w-0">
              <Logo compact />
              <div className="min-w-0">
                <div className="font-semibold tracking-tight">AI Assistant</div>
                <div className="text-xs text-base-content/60 truncate">
                  Gemini · Personalized with your resources
                </div>
              </div>
              <span className="badge badge-outline hidden sm:inline-flex">Premium</span>
            </div>
            <button onClick={handleClear} className="btn btn-ghost btn-sm">
              Clear
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-xl w-full text-center">
                  <div className="flex justify-center mb-4">
                    <Logo />
                  </div>
                  <h2 className="text-xl font-semibold">Ask anything. Get a plan.</h2>
                  <p className="mt-2 text-base-content/70">
                    Upload PDFs in Resources, then ask questions here. I’ll answer using your material and format it clearly.
                  </p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div className="card bg-base-200 border border-base-300">
                      <div className="card-body p-4">
                        <div className="text-sm font-medium">Explain a concept</div>
                        <div className="text-xs text-base-content/70 mt-1">
                          “Summarize photosynthesis from my PDF as bullet points.”
                        </div>
                      </div>
                    </div>
                    <div className="card bg-base-200 border border-base-300">
                      <div className="card-body p-4">
                        <div className="text-sm font-medium">Make a schedule</div>
                        <div className="text-xs text-base-content/70 mt-1">
                          “Plan 7 days for calculus with 2 hours/day.”
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
                  >
                    <div className="chat-image avatar placeholder">
                      <div
                        className={[
                          'w-9 rounded-full',
                          message.role === 'user'
                            ? 'bg-base-200 text-base-content'
                            : 'bg-primary text-primary-content',
                        ].join(' ')}
                      >
                        <span className="text-xs font-semibold">
                          {message.role === 'user' ? userInitial : aiInitial}
                        </span>
                      </div>
                    </div>
                    <div
                      className={[
                        'chat-bubble whitespace-pre-wrap',
                        message.role === 'user'
                          ? 'chat-bubble-primary'
                          : 'chat-bubble-base-200 border border-base-300',
                      ].join(' ')}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="chat chat-start mt-4">
                <div className="chat-image avatar placeholder">
                  <div className="w-9 rounded-full bg-primary text-primary-content">
                    <span className="text-xs font-semibold">{aiInitial}</span>
                  </div>
                </div>
                <div className="chat-bubble chat-bubble-base-200 border border-base-300">
                  <span className="loading loading-dots loading-md"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-base-300 bg-base-100">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question, or request a study plan…"
                className="input input-bordered flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-primary"
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Send'}
              </button>
            </form>
            <div className="mt-2 text-xs text-base-content/60">
              Tip: For best answers, mention the PDF/topic name and what format you want (bullets, steps, flashcards).
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chatbot;
