import { useState, useEffect } from 'react';
import { Card, Descriptions, Avatar, Tag, Spin, Alert, Typography, Badge, Row, Col, Divider, Switch } from 'antd';
import { UserOutlined, TeamOutlined, ClockCircleOutlined, BuildOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

interface User {
  id: string;
  username: string;
  password?: string; // Shouldn't be returned by API but included in interface
  full_name: string;
  management_level: number;
  workspace_role: string;
  workspace: string;
  created_at: number; // UNIX timestamp
  updated_at: number; // UNIX timestamp
}

// Mock user data for testing
const mockUser: User = {
  id: "642a1b3e9f8d7e6c5b4a3d2c",
  username: "tranduc.bao",
  full_name: "Trần Đức Bảo",
  management_level: 3,
  workspace_role: "Kỹ sư phần mềm cao cấp",
  workspace: "Phòng Kỹ thuật - Công nghệ",
  created_at: Math.floor(Date.now() / 1000) - 7776000, // 90 days ago
  updated_at: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
};

const getManagementLevelText = (level: number): string => {
  switch (level) {
    case 1:
      return 'Nhân viên';
    case 2:
      return 'Quản lý cấp thấp';
    case 3:
      return 'Quản lý cấp trung';
    case 4:
      return 'Quản lý cấp cao';
    case 5:
      return 'Giám đốc';
    default:
      return `Cấp ${level}`;
  }
};

const getManagementLevelColor = (level: number): string => {
  switch (level) {
    case 1:
      return 'blue';
    case 2:
      return 'cyan';
    case 3:
      return 'green';
    case 4:
      return 'orange';
    case 5:
      return 'red';
    default:
      return 'default';
  }
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Use mock data for testing if flag is set
      if (useMockData) {
        setTimeout(() => {
          setUser(mockUser);
          setLoading(false);
        }, 1000); // Simulate API delay
        return;
      }

      try {
        const token = localStorage.getItem('user_token');
        if (!token) {
          setError('Bạn chưa đăng nhập');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/v1/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.data);
      } catch (err: any) {
        console.error('Failed to fetch user profile:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [useMockData]);

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Development toggle for mock data
  const toggleMockData = () => {
    setLoading(true);
    setUseMockData(prev => !prev);
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải thông tin người dùng...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Lỗi"
          description={
            <>
              {error}
              <div style={{ marginTop: 16 }}>
                <Switch 
                  checked={useMockData} 
                  onChange={toggleMockData} 
                  checkedChildren="Dữ liệu mẫu" 
                  unCheckedChildren="Dữ liệu API" 
                />
                <span style={{ marginLeft: 8 }}>Sử dụng dữ liệu mẫu</span>
              </div>
            </>
          }
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <Alert
          message="Không có dữ liệu"
          description={
            <>
              Không tìm thấy thông tin người dùng
              <div style={{ marginTop: 16 }}>
                <Switch 
                  checked={useMockData} 
                  onChange={toggleMockData} 
                  checkedChildren="Dữ liệu mẫu" 
                  unCheckedChildren="Dữ liệu API" 
                />
                <span style={{ marginLeft: 8 }}>Sử dụng dữ liệu mẫu</span>
              </div>
            </>
          }
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card bordered={false} className="profile-card">
      {process.env.NODE_ENV !== 'production' && (
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Switch 
            checked={useMockData} 
            onChange={toggleMockData} 
            checkedChildren="Dữ liệu mẫu" 
            unCheckedChildren="Dữ liệu API" 
          />
          <span style={{ marginLeft: 8 }}>Sử dụng dữ liệu mẫu</span>
        </div>
      )}
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Avatar 
            size={120} 
            style={{ 
              backgroundColor: '#1890ff',
              fontSize: '48px',
              margin: '16px 0'
            }}
          >
            {user.full_name ? getInitials(user.full_name) : <UserOutlined />}
          </Avatar>
          <Title level={3}>{user.full_name}</Title>
          <Tag color={getManagementLevelColor(user.management_level)} style={{ fontSize: '14px', padding: '4px 8px' }}>
            {getManagementLevelText(user.management_level)}
          </Tag>
        </Col>
        
        <Col xs={24} md={16}>
          <Descriptions 
            title="Thông tin cá nhân" 
            bordered 
            column={{ xs: 1, sm: 2 }}
          >
            <Descriptions.Item label="ID người dùng">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Họ và tên">{user.full_name}</Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <BuildOutlined /> Cấp quản lý
                </span>
              }
            >
              <Badge 
                color={getManagementLevelColor(user.management_level)} 
                text={getManagementLevelText(user.management_level)}
              />
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <TeamOutlined /> Vai trò
                </span>
              }
              span={2}
            >
              {user.workspace_role}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <TeamOutlined /> Phòng ban
                </span>
              }
              span={2}
            >
              {user.workspace}
            </Descriptions.Item>
          </Descriptions>

          <Divider />
          
          <Descriptions title="Thông tin tài khoản" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item 
              label={
                <span>
                  <ClockCircleOutlined /> Ngày tạo
                </span>
              }
            >
              {moment(user.created_at * 1000).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <ClockCircleOutlined /> Cập nhật gần nhất
                </span>
              }
            >
              {moment(user.updated_at * 1000).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default Profile;