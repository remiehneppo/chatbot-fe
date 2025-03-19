import { useState, useEffect } from "react";
import { Input, Button, Card, List, Spin, Space, Typography, Collapse } from "antd";
import { SendOutlined, PlusOutlined, BulbOutlined } from "@ant-design/icons";
import ReactMarkdown from 'react-markdown';
import "./Chatbot.css";
import { api } from "../services/api";

interface Message {
  role: string;
  content: string;
}

interface ChatRequest {
  chat_id?: string;
  messages: Message[];
}

interface ChatResponse {
  status : boolean;
  message: string;
  data: {
    chat_id: string;
    message: Message;
  }
}

// Add this new component for rendering messages with thinking sections
const BotMessageRenderer = ({ content }: { content: string }) => {
  // Check if the message contains thinking tags
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>\s*([\s\S]*)/);
  
  if (!thinkMatch) {
    // Regular message without thinking section
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }
  
  const [thinking, actualResponse] = [thinkMatch[1].trim(), thinkMatch[2].trim()];
  
  return (
    <div className="bot-message-container">
      {thinking && (
        <Collapse 
          className="thinking-collapse"
          size="small"
          ghost
          items={[
            {
              key: '1',
              label: (
                <Typography.Text type="secondary">
                  <BulbOutlined /> Show thinking process
                </Typography.Text>
              ),
              children: (
                <div className="thinking-content">
                  <Typography.Text type="secondary" italic>
                    <ReactMarkdown>{thinking}</ReactMarkdown>
                  </Typography.Text>
                </div>
              )
            }
          ]}
        />
      )}
      
      <div className="actual-response">
        <ReactMarkdown>{actualResponse}</ReactMarkdown>
      </div>
    </div>
  );
};

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
      const response = await api.post<ChatResponse>("/api/v1/chat", {
        chat_id: chatId,
        messages
      })

      if (!response.status) throw new Error('Network response was not ok');
      
      const chatRes = await response.data;
      // Save chat ID if it's a new conversation
      if (!chatId) {
        setChatId(chatRes.data.chat_id);
        localStorage.setItem('chatId', chatRes.data.chat_id);
      }
      return chatRes.data.message;
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
                <BotMessageRenderer content={msg.content} />
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
