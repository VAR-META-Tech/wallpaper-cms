import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallpapers from './pages/Wallpapers';
import Categories from './pages/Categories';
import Collections from './pages/Collections';
import './App.css';

const App: React.FC = () => {
  const { isAuthenticated, verifyToken } = useAuthStore();

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AntApp>
        <Router>
          <div className="App">
            {!isAuthenticated ? (
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            ) : (
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/wallpapers" element={<Wallpapers />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            )}
          </div>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
