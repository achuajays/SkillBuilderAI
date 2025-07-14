
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Chat as GenAIChat } from "@google/genai";
import { ai } from '../services/geminiService';
import { ChatMessage } from '../types';
import SendIcon from './icons/SendIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface ChatProps {
  topic: string;
  skill: string;
}

const Chat: React.FC<ChatProps> = ({ topic, skill }) => {
  const [chat, setChat] = useState<GenAIChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const systemInstruction = `You are a friendly and encouraging AI tutor. The user is learning about "${skill}", and today's specific topic is "${topic}". Your goal is to help them understand this topic better. Keep your answers concise, clear, and directly related to the topic. Ask clarifying questions to guide them. Do not answer questions outside this topic.`;
    
    const newChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
    });
    setChat(newChat);
    setMessages([
      { role: 'model', content: `Hello! I'm your AI tutor for today. Ask me anything about "${topic}"!` }
    ]);
  }, [topic, skill]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: messageToSend });

      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = modelResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] lg:h-full max-h-[700px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI Tutor</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Topic: {topic}</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto no-scrollbar space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-xs xl:max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary-500 text-white rounded-br-lg' 
                : msg.isError 
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-bl-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-lg px-4 py-2.5 flex items-center space-x-2">
                <SpinnerIcon className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-grow block w-full rounded-md border-0 py-2.5 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="inline-flex items-center justify-center rounded-md h-11 w-11 bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-600/50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
