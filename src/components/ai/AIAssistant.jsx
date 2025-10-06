import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Minimize2, 
  Maximize2,
  Brain,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI study assistant. I can help you with engineering topics like Computer Science, Electronics, Mechanical, Civil Engineering, and more. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!currentUser) {
      setError('Please login to use the AI assistant');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const messageToSend = inputMessage;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to use AI assistant');
      }
      
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: currentUser.id || currentUser.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Invalid response from server');
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      setError(`Error: ${err.message}`);
      
      // Fallback message on error
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Sorry, I encountered an error: ${err.message}. Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Explain data structures",
    "Help with calculus",
    "Digital electronics basics",
    "Thermodynamics concepts"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50" data-testid="ai-assistant-trigger">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          data-testid="open-ai-assistant-btn"
        >
          <Brain className="h-6 w-6" />
        </Button>
        <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
          AI Study Assistant
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="ai-assistant-chat">
      <Card className={`w-96 h-[500px] shadow-2xl border-0 ${isMinimized ? 'h-16' : ''} transition-all duration-300`}>
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle className="text-lg">AI Study Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                Beta
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20"
                data-testid="minimize-ai-assistant-btn"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
                data-testid="close-ai-assistant-btn"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
            {error && (
              <Alert variant="destructive" className="m-4 mb-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" data-testid="ai-chat-messages">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    data-testid={`ai-message-${message.type}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'ai' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.type === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        message.type === 'ai' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3" data-testid="ai-loading-indicator">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-gray-100">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Quick questions to get started:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs h-7"
                      data-testid={`quick-question-${index}`}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about engineering..."
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="ai-chat-input"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="ai-send-message-btn"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                AI can help with engineering topics, problem solving, and study guidance
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIAssistant;