import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  ArrowLeft, 
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  AlertTriangle,
  Volume2,
  VolumeX
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { callLLMWebhook } from "@/services/webhook";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  attachments?: string[];
  confidence?: number;
  citations?: string[];
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm your Digital Krishi assistant. I'm here to help you with all your farming questions. You can ask me about crop diseases, weather, market prices, or any agricultural topic. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Soft auth gate: require login on submit
    const token = localStorage.getItem("digital-krishi-token");
    if (!token) {
      // preserve draft and redirect to login
      localStorage.setItem("dk-draft-chat", newMessage);
      toast({
        title: "Login required",
        description: "Please login to send your query and save it to your account.",
      });
      navigate("/login", { state: { from: "/chat" } });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    // Call the configured LLM webhook (if available). If webhook fails or is not configured,
    // fall back to the previous mock responses so the UI remains functional.
    try {
      const token = localStorage.getItem("digital-krishi-token") || undefined;
      const resp = await callLLMWebhook(userMessage.content, token);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: resp.text,
        confidence: resp.confidence,
        citations: resp.citations,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Save to "My Queries" if authenticated
      const authToken = localStorage.getItem("digital-krishi-token");
      if (authToken) {
        try {
          const existing = JSON.parse(localStorage.getItem("digital-krishi-queries") || "[]");
          existing.unshift({
            text: userMessage.content,
            answer: botMessage.content,
            confidence: botMessage.confidence,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("digital-krishi-queries", JSON.stringify(existing));
        } catch (e) {
          // ignore storage errors in demo
        }
      }

    } catch (err: any) {
      console.error('LLM webhook error', err);
      toast({
        title: 'AI Service Unavailable',
        description: 'Using local fallback response. The webhook may be misconfigured.',
        variant: 'destructive'
      });

      // Fallback: keep existing mock behavior
      setTimeout(() => {
        const fallback = {
          content: "Sorry, the AI service is currently unavailable. Please try again later.",
          confidence: 0,
          citations: []
        };

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: fallback.content,
          confidence: fallback.confidence,
          citations: fallback.citations,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 800);
      return;
    }

    setIsLoading(false);
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not access microphone or recognize speech",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser",
        variant: "destructive"
      });
    }
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleEscalate = (messageId: string) => {
    toast({
      title: "Query Escalated",
      description: "Your query has been forwarded to a human expert. You'll receive a response within 24 hours.",
    });
  };

  const handleSaveToDiary = (messageId: string) => {
    toast({
      title: "Saved to Farm Diary",
      description: "This advice has been saved to your farm diary for future reference.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Chat Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Get instant farming advice • കൃഷി സഹായം
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-32">
        {/* Chat Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                <div className={`p-4 rounded-2xl ${
                  message.type === "user" 
                    ? "chat-bubble-user ml-auto" 
                    : "chat-bubble-bot"
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.type === "bot" && message.confidence && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Confidence Score</span>
                        <span className="text-xs font-medium">{message.confidence}%</span>
                      </div>
                      <Progress value={message.confidence} className="h-1" />
                    </div>
                  )}

                  {message.type === "bot" && message.citations && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                      <div className="space-y-1">
                        {message.citations.map((citation, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                            {citation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Actions for Bot Messages */}
                {message.type === "bot" && (
                  <div className="flex items-center space-x-2 mt-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTextToSpeech(message.content)}
                      disabled={isSpeaking}
                    >
                      {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveToDiary(message.id)}
                    >
                      <BookOpen className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEscalate(message.id)}
                    >
                      <AlertTriangle className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-1 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble-bot max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">AI is typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1 space-y-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask about crops, diseases, weather, market prices..."
                className="min-h-[60px] max-h-32 resize-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceInput}
                  disabled={isRecording}
                  className={isRecording ? "bg-destructive text-destructive-foreground" : ""}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {isRecording && (
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Listening...
                  </span>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="gradient-primary text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "What's wrong with my tomato plants?",
              "Best time to plant paddy?",
              "Market prices for banana",
              "Weather forecast for farming"
            ].map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setNewMessage(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;