import { useState } from 'react';
import { Input, Card, Tag, Space, Empty, Select, InputNumber, Typography, Button, Col, Row, message } from 'antd';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
const { Text, Title } = Typography;
import { config } from '../config/config';

interface Metadata {
  title: string;
  source: string;
  tags: string[];
  custom: { [key: string]: string }  // or Record<string, string>, page value: custom["page"]
}

interface Document {
  id: string;
  content: string;
  metadata: Metadata;
  created_at: number;
}

interface SearchRequest {
  queries: string[];
  tags?: string[];
  limit?: number;
}

interface DataResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface SearchResponse {
  documents: Document[];
}

const highlightText = (text: string, queries: string[]): string => {
  if (!queries.length) return text;
  
  const pattern = queries
    .filter(q => q.trim())
    .map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  if (!pattern) return text;
  
  return text.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
};

const DocumentSearch = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [queries, setQueries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);

  const handleSearch = async (value: string) => {
    setError(null); // Reset error state before new search
    
    const newQueries = value.trim() ? value.split(',').filter(q => q.length > 0) : [];
    setQueries(newQueries);
    
    if (!value.trim() && selectedTags.length === 0) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    try {
      const searchRequest: SearchRequest = {
        queries: value.trim() ? value.split(',').filter(q => q.length > 0) : [],
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        limit: limit
      };

      console.log('Sending request:', searchRequest); // Debug log

      const response = await fetch(`${config.apiUrl}/api/v1/documents/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(searchRequest)
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response headers:', Object.fromEntries(response.headers.entries())); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText); // Debug log
        throw new Error(`Search failed: ${errorText}`);
      }
      
      const responseData: DataResponse<SearchResponse> = await response.json();
      console.log('Response data:', responseData); // Debug log

      if (responseData.status === 'success') {
        console.log('Search results:', responseData.data.documents); // Debug log
        setDocuments(responseData.data.documents);
        if (!responseData.data.documents || responseData.data.documents.length === 0) {
          setError('No matching documents found');
        }
      } else {
        throw new Error(responseData.message);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (filename: string, pageNumber?: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/pdf?file=${encodeURIComponent(filename)}`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
  
      // Create blob from response and open in new window with page number
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      // Add page number to URL if available
      const urlWithPage = pageNumber ? `${fileUrl}#page=${pageNumber}` : fileUrl;
      window.open(urlWithPage, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
      message.error('Failed to open PDF file');
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) {
      message.warning('Please enter a question');
      return;
    }
  
    setIsAskingAI(true);
    try {
      const askAIRequest = {
        question: aiQuestion,
        search_request: {
          queries: searchTerm.trim() ? searchTerm.split(',').filter(q => q.length > 0) : [],
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          limit: limit
        }
      };
  
      const response = await fetch(`${config.apiUrl}/api/v1/documents/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(askAIRequest)
      });
  
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
  
      const responseData = await response.json();
      if (responseData.status === 'success') {
        setDocuments(responseData.data.documents);
      } else {
        throw new Error(responseData.message);
      }
    } catch (error) {
      console.error('AI error:', error);
      message.error('Failed to get AI response');
    } finally {
      setIsAskingAI(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card title="Tìm kiếm tài liệu" className="search-container">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={14}>
            <Input.Search
              placeholder="Search documents..."
              enterButton={<SearchOutlined />}
              size="large"
              loading={loading}
              onSearch={handleSearch}
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </Col>
          <Col span={10}>
            <Space.Compact style={{ width: '100%' }}>
              <Input.TextArea
                placeholder="Ask AI about documents..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                style={{ width: '75%', height: '100%' }}
                rows={1}
                size="large"
              />
              <Button 
                type="primary"
                onClick={handleAskAI}
                loading={isAskingAI}
                style={{ 
                  width: '25%', 
                  height: '41px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                size="large"
              >
                Ask AI
              </Button>
            </Space.Compact>
          </Col>
        </Row>

        <Space>
          <Select
            mode="tags"
            style={{ minWidth: 200 }}
            placeholder="Filter by tags"
            onChange={setSelectedTags}
            value={selectedTags}
          />
          
          <InputNumber
            min={1}
            max={100}
            defaultValue={10}
            onChange={(value) => setLimit(value || 10)}
            addonBefore="Limit"
          />
        </Space>

        <Row gutter={[16, 16]}>
          {documents?.length > 0 ? (
            documents.map(doc => (
              <Col xs={24} key={doc.id}>
                <Card
                  className="document-card"
                  title={
                    <Space direction="vertical" size={0}>
                      <Title 
                        level={5} 
                        style={{ 
                          margin: 0,
                          cursor: 'pointer',
                          color: '#1890ff'
                        }}
                        onClick={() => handleViewPdf(
                          doc.metadata.title,
                          doc.metadata.custom?.page
                        )}
                      >
                        {doc.metadata.title}
                      </Title>
                      <Space split={<Text type="secondary">|</Text>}>
                        {doc.metadata.source && (
                          <Text type="secondary">
                            Source: {doc.metadata.source}
                          </Text>
                        )}
                        <Text type="secondary">
                          Created: {new Date(doc.created_at * 1000).toLocaleDateString()}
                        </Text>
                        {doc.metadata.custom?.page && (
                          <Text type="secondary">
                            Page: {doc.metadata.custom.page}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                  extra={
                    <Button
                      type="link"
                      onClick={() => toggleExpand(doc.id)}
                      icon={expandedId === doc.id ? <UpOutlined /> : <DownOutlined />}
                    >
                      {expandedId === doc.id ? 'Show less' : 'Show more'}
                    </Button>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <Space size={[0, 8]} wrap>
                      {doc.metadata.tags.map(tag => (
                        <Tag 
                          key={tag} 
                          color="blue"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (!selectedTags.includes(tag)) {
                              setSelectedTags([...selectedTags, tag]);
                              handleSearch(searchTerm);
                            }
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                    
                    <div className="document-content" style={{ textAlign: 'left' }}>
                      <div
                        dangerouslySetInnerHTML={{ 
                          __html: expandedId === doc.id 
                            ? highlightText(doc.content, queries)
                            : highlightText(doc.content.substring(0, 200) + '...', queries)
                        }}
                      />
                      {doc.metadata.custom?.generative && (
                        <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                          <Text strong>AI Response:</Text>
                          <div style={{ marginTop: 8 }}>
                            {doc.metadata.custom.generative}
                          </div>
                        </div>
                      )}
                    </div>
                  </Space>
                </Card>
              </Col>
            ))
          ) : !loading && (
            <Col span={24}>
              <Empty
                description={
                  <Space direction="vertical" align="center">
                    <Text type="secondary">{error || "No documents found"}</Text>
                    {searchTerm && (
                      <Button onClick={() => {
                        setSearchTerm('');
                        setSelectedTags([]);
                        setDocuments([]);
                        setError(null);
                      }}>
                        Clear search
                      </Button>
                    )}
                  </Space>
                }
              />
            </Col>
          )}
        </Row>
      </Space>
    </Card>
  );
};

export default DocumentSearch;