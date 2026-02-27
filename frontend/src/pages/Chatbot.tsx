import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    isError?: boolean;
}

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'agent', text: 'Hello! I am your AI Pharmacy Assistant. How can I help you today? You can type or use your microphone to speak.' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [sessionID] = useState(() => Math.random().toString(36).substring(7));
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Initialize Web Speech API
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Could not start recognition", e);
            }
        }
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            // Remove any markdown or weird symbols before speaking
            const cleanText = text.replace(/[*_#`~]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/chat', { text: userMessage.text, session_id: sessionID });
            const botResponseText = res.data.response;

            const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'agent', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);
            speak(botResponseText);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                text: 'Sorry, I am having trouble connecting to the backend server. Please make sure FastAPI is running on port 8000.',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
                <div>
                    <h2 className="text-xl font-bold">Patient Portal</h2>
                    <p className="text-blue-100 text-sm opacity-90">Conversational AI Agent</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-blue-500 text-xs px-2 py-1 rounded-full font-medium">LangGraph Powered</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-100 ml-3' : 'bg-gray-200 mr-3'}`}>
                                {msg.sender === 'user' ? <User className="text-blue-600" size={20} /> : <Bot className="text-gray-600" size={20} />}
                            </div>

                            <div className={`px-5 py-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : msg.isError ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                            <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />
                            <span className="text-gray-500 italic text-sm">Agent is thinking... (checking tools)</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-3">
                    <button
                        type="button"
                        onClick={toggleListen}
                        className={`p-3 rounded-full transition-colors flex-shrink-0 flex items-center justify-center ${isListening
                            ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-300 ring-offset-2'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        title="STT / Voice Input"
                    >
                        {isListening ? <Mic size={22} /> : <MicOff size={22} />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your medication order or question..."
                        className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        disabled={isListening || isLoading}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center shadow-md flex-shrink-0"
                    >
                        <Send size={22} />
                    </button>
                </form>
            </div>
        </div>
    );
}
