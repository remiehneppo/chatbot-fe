import { useState, useEffect } from "react";
import { Input, Button, Card, List, Spin, Space } from "antd";
import { SendOutlined, PlusOutlined } from "@ant-design/icons";
import ReactMarkdown from 'react-markdown';
import { config } from '../config/config';
import "./Chatbot.css";

interface Message {
  role: string;
  content: string;
}

interface ChatRequest {
  chat_id?: string;
  messages: Message[];
}

interface ChatResponse {
  chat_id: string;
  message: Message;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string>("");

  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      const savedChatId = localStorage.getItem('chatId');
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      }
      
      if (savedChatId) {
        setChatId(savedChatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Reset if there's an error
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('chatId');
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
      }
      if (chatId) {
        localStorage.setItem('chatId', chatId);
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages, chatId]);  // Add chatId as dependency

  const sendChatMessage = async (messages: Message[]): Promise<Message | null> => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages,
          chat_id: chatId 
        } as ChatRequest)
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data: ChatResponse = await response.json();
      // Save chat ID if it's a new conversation
      if (!chatId) {
        setChatId(data.chat_id);
        localStorage.setItem('chatId', data.chat_id);
      }
      return data.message;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { 
      role: "user", 
      content: input 
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const botMessage = await sendChatMessage([...messages, userMessage]);
    if (botMessage) {
      setMessages(prev => [...prev, botMessage]);
    }

    setLoading(false);
  };

  // Update handleNewChat to ensure clean reset
  const handleNewChat = () => {
    try {
      setMessages([]);
      setChatId("");
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('chatId');
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <Card 
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>Trợ lý ảo AI</span>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleNewChat}
          >
            New Chat
          </Button>
        </Space>
      } 
      className="chat-container"
    >
      <List
        className="chat-messages"
        dataSource={messages}
        renderItem={(msg) => (
          <List.Item>
            <div className={msg.role === "user" ? "user-message" : "bot-message"}>
              {msg.role === "user" ? (
                msg.content
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </List.Item>
        )}
      />
      <div className="loading-container" style={{ textAlign: 'center', margin: '10px 0' }}>
        {loading && <Spin />}
      </div>
      <div className="chat-input">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onPressEnter={handleSend}
          disabled={loading}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          disabled={loading}
        />
      </div>
    </Card>
  );
};

export default Chatbot;
