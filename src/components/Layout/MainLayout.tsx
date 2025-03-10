import React from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, RobotOutlined, ProfileOutlined, ScheduleOutlined, SearchOutlined, GithubOutlined } from '@ant-design/icons';
import './MainLayout.css';
const { Header, Content, Footer } = Layout;
const { Title, Text, Link: AntLink } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: '/chatbot',
      icon: <RobotOutlined />,
      label: <Link to="/chatbot">Chatbot</Link>,
    },
    {
      key: '/tasks',
      icon: <ScheduleOutlined />,
      label: <Link to="/tasks">Công việc</Link>,
    },
    {
      key: '/profile',
      icon: <ProfileOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: '/document-search',
      icon: <SearchOutlined />,
      label: <Link to="/document-search">Tìm kiếm tài liệu</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          padding: '0 24px', 
          background: '#001529', 
          height: '64px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Space align="center">
          <img 
            src="./logo.png" 
            alt="Logo" 
            style={{ height: '80px', marginRight: '16px' }} 
          />
          <Title 
            level={4} 
            style={{ 
              color: '#fff', 
              margin: 0 
            }}
          >
            Phòng Kỹ thuật - Công nghệ
          </Title>
        </Space>
        <Space>
          <Text style={{ color: '#fff' }}>Version 1.0</Text>
        </Space>
      </Header>
      
      <Header 
        style={{ 
          padding: 0, 
          background: '#fff', 
          height: '20px', 
          lineHeight: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            justifyContent: 'center',
            height: '64px',  // Match menu height with header
            lineHeight: '64px', // Match line height for vertical centering
            fontSize: '16px'  // Optional: increase font size
          }}
        />
      </Header>
      
      <Content 
        className='main-content' 
        style={{ 
          padding: '12px',
          height: 'calc(100vh - 250px)', // Updated to account for footer
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {children}
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: '#69b1ff',
          color: '#fff',
          height: '64px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Space direction="vertical" size={4}>
          <Text style={{ color: '#fff' }}>
            © 2024 Trần Đức Bảo - PKT-CN. All rights reserved.
          </Text>
          <Space split={<Text style={{ color: '#fff' }}>|</Text>}>
            <AntLink 
              href="https://github.com/remiehneppo/chatbot-fe" 
              target="_blank"
              style={{ color: '#fff' }}
            >
              <Space>
                <GithubOutlined />
                Frontend Repository
              </Space>
            </AntLink>
            <AntLink 
              href="https://github.com/remiehneppo/chatbot-be" 
              target="_blank"
              style={{ color: '#fff' }}
            >
              <Space>
                <GithubOutlined />
                Backend Repository
              </Space>
            </AntLink>
          </Space>
        </Space>
      </Footer>
    </Layout>
  );
};

export default MainLayout;