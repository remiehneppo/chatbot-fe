import { useState } from 'react';
import { Input, Card, List, Tag, Space, Empty, Select, InputNumber, Typography, Button } from 'antd';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
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

const DocumentSearch = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleSearch = async (value: string) => {
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
      } else {
        throw new Error(responseData.message);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (expandedIds.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
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

        <List
          className="document-list"
          loading={loading}
          dataSource={documents}
          locale={{
            emptyText: <Empty description="No documents found" />
          }}
          renderItem={(doc) => (
            <List.Item 
              className="document-list-item"
              actions={[
                <Button
                  type="link"
                  onClick={() => toggleExpand(doc.id)}
                  icon={expandedIds.has(doc.id) ? <UpOutlined /> : <DownOutlined />}
                >
                  {expandedIds.has(doc.id) ? 'Show less' : 'Show more'}
                </Button>
              ]}
            >
              <List.Item.Meta
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
                description={
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {/* Tags section */}
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
                    
                    {/* Content preview/full section */}
                    <div className="document-content" style={{ textAlign: 'justify' }}>
                      {expandedIds.has(doc.id) ? (
                        <ReactMarkdown>
                          {'...' + doc.content + '...'}
                        </ReactMarkdown>
                      ) : (
                        <ReactMarkdown >
                          {'...' + doc.content.substring(0, 200) + '...'}
                        </ReactMarkdown>
                      )}
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
};

export default DocumentSearch;