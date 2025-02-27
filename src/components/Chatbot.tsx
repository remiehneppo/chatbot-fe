import { useState, useEffect, useRef, useCallback } from "react";
import { Input, Button, Card, List, Spin, Upload, Modal, Form, Select, message, Progress } from "antd";
import { SendOutlined, UploadOutlined } from "@ant-design/icons";
import ReactMarkdown from 'react-markdown';
import "./Chatbot.css";

interface Message {
  role: string;
  content: string;
}

interface WebsocketRequest {
  type: string;
  payload: {
    messages: Message[];
  };
}

interface WebSocketResponse {
  type: string;
  payload: {
    message?: string;
  };
}

// Add new interface
interface UploadRequest {
  title: string;
  source: string;
  tags: string[];
  file: File;
}

// Add new interface for processing status
interface ProcessingDocumentStatus {
  status: string;
  message: string;
  progress: number;
  total_pages: number;
  processed_pages: number;
}

const WS_URL = "ws://localhost:8888/ws/chat";
const ENDPOINT = "http://localhost:8888";

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form] = Form.useForm();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Add new state for processing status
  const [processingStatus, setProcessingStatus] = useState<ProcessingDocumentStatus | null>(null);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      const response: WebSocketResponse = JSON.parse(event.data);
      
      switch (response.type) {
        case "chat":
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: response.payload.message || "" 
          }]);
          setLoading(false);
          break;
        case "processing":
          console.log("Processing:", response.payload.message);
          break;
        case "error":
          console.error("Error:", response.payload.message);
          setLoading(false);
          break;
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
      
      // Thử kết nối lại với độ trễ tăng dần
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        console.log(`Attempting to reconnect in ${timeout/1000} seconds...`);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, timeout);
      } else {
        console.log("Max reconnection attempts reached");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const userMessage: Message = { 
      role: "user", 
      content: input 
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const request: WebsocketRequest = {
        type: "chat",
        payload: {
          messages: [...messages, userMessage]
        }
      };

      wsRef.current?.send(JSON.stringify(request));
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };

  // Modify handleUpload function
  const handleUpload = async (values: { title: string; source: string; tags: string[] }) => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    
    const metadata: UploadRequest = {
      title: values.title,
      source: values.source,
      tags: values.tags,
      file: selectedFile
    };
    
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('file', selectedFile);

    try {
      const response = await fetch(ENDPOINT + "/api/v1/upload", {
        method: 'POST',
        body: formData,
      });

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text and parse JSON
        const chunk = new TextDecoder().decode(value);
        const status: ProcessingDocumentStatus = JSON.parse(chunk);
        
        setProcessingStatus(status);

        // Handle different status types
        switch (status.status) {
          case 'processing':
            message.info(`Processing: ${status.message} (${Math.round(status.progress)}%)`);
            break;
          case 'completed':
            message.success('Document processed successfully');
            setFileModalVisible(false);
            form.resetFields();
            setSelectedFile(null);
            setProcessingStatus(null);
            break;
          case 'error':
            message.error(status.message);
            setProcessingStatus(null);
            break;
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Modify uploadProps
  const uploadProps = {
    beforeUpload: (file: File) => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        message.error('Only PDF, DOC, and DOCX files are allowed!');
        return Upload.LIST_IGNORE;
      }
      setSelectedFile(file);
      setFileModalVisible(true);
      return false;
    },
    showUploadList: false,
  };

  // Modify FileMetadataModal to show processing status
  const FileMetadataModal = () => (
    <Modal
      title="Document Information"
      open={fileModalVisible}
      onCancel={() => {
        setFileModalVisible(false);
        setSelectedFile(null);
        form.resetFields();
        setProcessingStatus(null);
      }}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpload}
      >
        <Form.Item
          name="title"
          label="Document Title"
          rules={[{ required: true, message: 'Please input the document title!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="source"
          label="Source"
          rules={[{ required: true, message: 'Please input the document source!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="tags"
          label="Tags"
          rules={[{ required: true, message: 'Please add at least one tag!' }]}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Add tags"
            tokenSeparators={[',']}
          />
        </Form.Item>

        {processingStatus && (
          <div style={{ marginBottom: 16 }}>
            <Progress 
              percent={Math.round(processingStatus.progress)} 
              status={processingStatus.status === 'error' ? 'exception' : 'active'}
              format={() => `${processingStatus.processed_pages}/${processingStatus.total_pages} pages`}
            />
            <p style={{ marginTop: 8, color: '#666' }}>
              {processingStatus.message}
            </p>
          </div>
        )}

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => {
              setFileModalVisible(false);
              setSelectedFile(null);
              form.resetFields();
              setProcessingStatus(null);
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={uploading} disabled={!!processingStatus}>
              Upload
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <Card 
      title="Chatbot AI" 
      className="chat-container"
      extra={
        <div className="header-actions">
          <Upload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />} 
              loading={uploading}
            >
              Upload Document
            </Button>
          </Upload>
          <span style={{ color: isConnected ? 'green' : 'red', marginLeft: '10px' }}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      }
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
      {loading && <Spin />}
      <div className="chat-input">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onPressEnter={handleSend}
          disabled={!isConnected}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          disabled={!isConnected}
        />
      </div>
      <FileMetadataModal />
    </Card>
  );
};

export default Chatbot;
