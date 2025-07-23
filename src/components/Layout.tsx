import React from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Space, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  PictureOutlined,
  AppstoreOutlined,
  FolderOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/wallpapers',
      icon: <PictureOutlined />,
      label: 'Wallpapers',
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: 'Categories',
    },
    {
      key: '/collections',
      icon: <FolderOutlined />,
      label: 'Collections',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="dark">
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #303030'
        }}>
          <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
            Wallpaper CMS
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ marginTop: 16 }}
        />
      </Sider>
      
      <AntLayout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div />
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong>{user?.username || 'Admin'}</Text>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;