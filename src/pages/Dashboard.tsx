import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Space, Spin } from 'antd';
import {
  PictureOutlined,
  AppstoreOutlined,
  FolderOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { wallpaperApi, categoryApi, collectionApi } from '../services/api';
import type { Wallpaper, WallpaperType } from '../types/interfaces';
import { WallpaperType as WallpaperTypeEnum } from '../types/interfaces';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWallpapers: 0,
    totalCategories: 0,
    totalCollections: 0,
    totalDownloads: 0,
  });
  const [recentWallpapers, setRecentWallpapers] = useState<Wallpaper[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats with proper totals from metadata
      const [wallpapersRes, categoriesRes, collectionsRes] = await Promise.all([
        wallpaperApi.getAll({ page: 1, limit: 5 }), // Just for recent wallpapers
        categoryApi.getAll(),
        collectionApi.getAll(),
      ]);

      const recentWallpapers = wallpapersRes.data.data;
      const categories = categoriesRes.data.data;
      const collections = collectionsRes.data.data;
      
      // Get actual total from metadata
      const totalWallpapers = wallpapersRes.data.meta?.total || 0;

      // Calculate total downloads from recent wallpapers (temporary solution)
      // TODO: Need backend endpoint for total downloads across all wallpapers
      const recentDownloads = recentWallpapers.reduce((sum, w) => sum + w.downloads, 0);

      setStats({
        totalWallpapers,
        totalCategories: categories.length,
        totalCollections: collections.length,
        totalDownloads: recentDownloads, // This is only from recent 5, not accurate
      });

      setRecentWallpapers(recentWallpapers);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: WallpaperType) => {
    switch (type) {
      case WallpaperTypeEnum.LIVE:
        return 'red';
      case WallpaperTypeEnum.PARALLAX:
        return 'blue';
      case WallpaperTypeEnum.DOUBLE:
        return 'green';
      default:
        return 'default';
    }
  };

  const recentWallpaperColumns = [
    {
      title: 'Preview',
      dataIndex: 'thumbnailUrl',
      key: 'preview',
      width: 80,
      render: (url: string) => (
        <img 
          src={url} 
          alt="preview" 
          style={{ 
            width: 50, 
            height: 70, 
            objectFit: 'cover', 
            borderRadius: 4 
          }} 
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: WallpaperType) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Downloads',
      dataIndex: 'downloads',
      key: 'downloads',
      render: (downloads: number) => downloads.toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'status',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Wallpapers"
              value={stats.totalWallpapers}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={stats.totalCategories}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Collections"
              value={stats.totalCollections}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Downloads"
              value={stats.totalDownloads}
              prefix={<DownloadOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Wallpapers" style={{ marginTop: 24 }}>
        <Table
          columns={recentWallpaperColumns}
          dataSource={recentWallpapers}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
};

export default Dashboard;