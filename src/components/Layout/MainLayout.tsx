import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, RobotOutlined, ProfileOutlined, ScheduleOutlined, SearchOutlined } from '@ant-design/icons';
import './MainLayout.css';
const { Header, Content } = Layout;

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
      <Header style={{ padding: 0, background: '#fff', height: '48px', lineHeight: '48px' }}>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ justifyContent: 'center' }}
        />
      </Header>
      <Content 
        className='main-content' 
        style={{ 
          padding: '12px',
          height: 'calc(100vh - 48px)',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;