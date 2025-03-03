import { useState } from 'react';
import { Input, Card, Tag, Space, Empty, Select, InputNumber, Typography, Button, Col, Row } from 'antd';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
const { Text, Title } = Typography;

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

      const response = await fetch('http://localhost:8888/api/v1/documents/search', {
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card title="Document Search" className="search-container">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Input.Search
          placeholder="Search documents..."
          enterButton={<SearchOutlined />}
          size="large"
          loading={loading}
          onSearch={handleSearch}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
        
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
                      <Title level={5} style={{ margin: 0 }}>
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
                    
                    <div 
                      className="document-content" 
                      style={{ textAlign: 'left' }}
                      dangerouslySetInnerHTML={{ 
                        __html: expandedId === doc.id 
                          ? highlightText(doc.content, queries)
                          : highlightText(doc.content.substring(0, 200) + '...', queries)
                      }}
                    />
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