import { useState } from "react";
import { Input, Button, Card, List, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import ReactMarkdown from 'react-markdown';
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

  const sendChatMessage = async (messages: Message[]): Promise<Message | null> => {
    try {
      const response = await fetch('http://localhost:8888/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages } as ChatRequest)
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data: ChatResponse = await response.json();
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

  return (
    <Card 
      title="Chatbot AI" 
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
