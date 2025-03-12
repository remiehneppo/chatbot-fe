import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { DashboardOutlined, UserOutlined, FileOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
    {
      key: '/admin/documents',
      icon: <FileOutlined />,
      label: 'Quản lý tài liệu',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          padding: '0 24px',
          background: '#fff',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center">
          <div className="text-2xl font-bold text-blue-600 mr-8">
            Admin Portal
          </div>
        </div>
        <div className="flex items-center">
          <Dropdown 
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="flex items-center cursor-pointer">
              <Avatar 
                style={{ 
                  backgroundColor: '#1890ff',
                  marginRight: '8px' 
                }}
                icon={<UserOutlined />}
              />
              <span className="text-gray-700">Admin</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider 
          width={250} 
          theme="light"
          style={{
            borderRight: '1px solid rgba(0, 0, 0, 0.06)',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
            left: 0,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ 
              height: '100%', 
              borderRight: 0,
              padding: '16px 0'
            }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content 
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              borderRadius: 8,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;