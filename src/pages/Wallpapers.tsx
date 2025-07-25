import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Image, Input, Select, Modal, Form,
  Card, Typography, Switch, message, Popconfirm, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, DownloadOutlined
} from '@ant-design/icons';
import { wallpaperApi, categoryApi } from '../services/api';
import FileUpload from '../components/FileUpload';
import ParallaxLayersUpload from '../components/ParallaxLayersUpload';
import type { Wallpaper, Category, WallpaperType } from '../types/interfaces';
import { WallpaperType as WallpaperTypeEnum } from '../types/interfaces';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const Wallpapers: React.FC = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWallpaper, setEditingWallpaper] = useState<Wallpaper | null>(null);
  const [form] = Form.useForm();
  const [selectedWallpaperType, setSelectedWallpaperType] = useState<string>('');

  useEffect(() => {
    loadWallpapers();
    loadCategories();
  }, []);

  const loadWallpapers = async () => {
    try {
      setLoading(true);
      const response = await wallpaperApi.getAll({
        page: 1,
        limit: 100,
        type: selectedType || undefined,
        category: selectedCategory || undefined,
      });
      setWallpapers(response.data.data);
    } catch (error) {
      message.error('Failed to load wallpapers');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data);
    } catch (error) {
      message.error('Failed to load categories');
    }
  };

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      loadWallpapers();
      return;
    }

    try {
      setLoading(true);
      const response = await wallpaperApi.search(value, { page: 1, limit: 100 });
      setWallpapers(response.data.data);
    } catch (error) {
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await wallpaperApi.delete(id);
      message.success('Wallpaper deleted successfully');
      loadWallpapers();
    } catch (error) {
      message.error('Failed to delete wallpaper');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await wallpaperApi.toggleActive(id);
      message.success('Status updated successfully');
      loadWallpapers();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleEdit = (wallpaper: Wallpaper) => {
    setEditingWallpaper(wallpaper);
    setSelectedWallpaperType(wallpaper.type);
    
    // Convert tags array to comma-separated string for form
    const formValues = {
      ...wallpaper,
      tags: Array.isArray(wallpaper.tags) ? wallpaper.tags.join(', ') : wallpaper.tags
    };
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingWallpaper(null);
    setSelectedWallpaperType('');
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalSubmit = async (values: any) => {
    try {
      // Process tags - convert comma-separated string to array
      if (values.tags && typeof values.tags === 'string') {
        values.tags = values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      }

      // Ensure parallax settings are properly structured
      if (values.type === WallpaperTypeEnum.PARALLAX && values.parallaxSettings) {
        // Validate that at least one layer has an image
        const validLayers = values.parallaxSettings.layers.filter((layer: any) => layer.imageUrl);
        if (validLayers.length === 0) {
          message.error('At least one parallax layer must have an image');
          return;
        }
        values.parallaxSettings.layers = validLayers;
      }

      if (editingWallpaper) {
        await wallpaperApi.update(editingWallpaper.id, values);
        message.success('Wallpaper updated successfully');
      } else {
        await wallpaperApi.create(values);
        message.success('Wallpaper created successfully');
      }
      setModalVisible(false);
      loadWallpapers();
    } catch (error) {
      message.error(`Failed to ${editingWallpaper ? 'update' : 'create'} wallpaper`);
    }
  };

  const getTypeColor = (type: WallpaperType) => {
    switch (type) {
      case WallpaperTypeEnum.LIVE: return 'red';
      case WallpaperTypeEnum.PARALLAX: return 'blue';
      case WallpaperTypeEnum.DOUBLE: return 'green';
      default: return 'default';
    }
  };

  const columns: ColumnsType<Wallpaper> = [
    {
      title: 'Preview',
      dataIndex: 'thumbnailUrl',
      key: 'preview',
      width: 80,
      render: (url: string) => (
        <Image
          src={url}
          alt="preview"
          width={50}
          height={70}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          placeholder={<div style={{ width: 50, height: 70, background: '#f0f0f0', borderRadius: 4 }} />}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text: string, record: Wallpaper) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            ID: {record.id}
            {record.type === WallpaperTypeEnum.PARALLAX && record.parallaxSettings && (
              <div style={{ color: '#1890ff' }}>
                Layers: {record.parallaxSettings.layers?.length || 0}/3
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: Object.values(WallpaperTypeEnum).map(type => ({
        text: type,
        value: type,
      })),
      onFilter: (value, record) => record.type === value,
      render: (type: WallpaperType) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({
        text: cat.name,
        value: cat.name,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Downloads',
      dataIndex: 'downloads',
      key: 'downloads',
      sorter: (a, b) => a.downloads - b.downloads,
      render: (downloads: number) => (
        <Space>
          <DownloadOutlined />
          {downloads.toLocaleString()}
        </Space>
      ),
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured: boolean) => (
        <Tag color={featured ? 'gold' : 'default'}>
          {featured ? 'Featured' : 'Normal'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'status',
      render: (active: boolean, record: Wallpaper) => (
        <Switch
          checked={active}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record: Wallpaper) => (
        <Space size="small">
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => window.open(record.fullSizeUrl, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete wallpaper"
            description="Are you sure to delete this wallpaper?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Wallpapers Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Wallpaper
          </Button>
        </div>

        <Space size="middle" wrap>
          <Search
            placeholder="Search wallpapers..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          
          <Select
            placeholder="Filter by type"
            style={{ width: 150 }}
            allowClear
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value || '');
              loadWallpapers();
            }}
          >
            {Object.values(WallpaperTypeEnum).map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by category"
            style={{ width: 150 }}
            allowClear
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value || '');
              loadWallpapers();
            }}
          >
            {categories.map(category => (
              <Option key={category.id} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={wallpapers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: wallpapers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
        />
      </Space>

      <Modal
        title={editingWallpaper ? 'Edit Wallpaper' : 'Add Wallpaper'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type!' }]}
          >
            <Select onChange={(value) => setSelectedWallpaperType(value)}>
              {Object.values(WallpaperTypeEnum).map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select>
              {categories.map(category => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="thumbnailUrl"
            label="Thumbnail Image"
            rules={[{ required: true, message: 'Please upload thumbnail image!' }]}
          >
            <FileUpload 
              accept=".jpg,.jpeg,.png,.gif,.webp"
              maxSize={10}
              listType="picture-card"
            />
          </Form.Item>

          <Form.Item
            name="fullSizeUrl"
            label={
              selectedWallpaperType === WallpaperTypeEnum.LIVE ? "Video File" :
              selectedWallpaperType === WallpaperTypeEnum.DOUBLE ? "Left Image (User A)" :
              "Full Size Image"
            }
            rules={[{ required: true, message: `Please upload ${selectedWallpaperType === WallpaperTypeEnum.LIVE ? 'video' : 'image'} file!` }]}
          >
            <FileUpload 
              accept={selectedWallpaperType === WallpaperTypeEnum.LIVE ? ".mp4,.avi,.mov,.webm,.mkv" : ".jpg,.jpeg,.png,.gif,.webp"}
              maxSize={selectedWallpaperType === WallpaperTypeEnum.LIVE ? 100 : 10}
              listType="picture-card"
              allowVideo={selectedWallpaperType === WallpaperTypeEnum.LIVE}
            />
          </Form.Item>

          {selectedWallpaperType === WallpaperTypeEnum.DOUBLE && (
            <Form.Item
              name="lockScreenUrl"
              label="Right Image (User B)"
              rules={[{ required: true, message: 'Please upload right image for couple wallpaper!' }]}
            >
              <FileUpload 
                accept=".jpg,.jpeg,.png,.gif,.webp"
                maxSize={10}
                listType="picture-card"
              />
            </Form.Item>
          )}

          {selectedWallpaperType === WallpaperTypeEnum.PARALLAX && (
            <Form.Item
              name="parallaxSettings"
              label="Parallax Layers Configuration"
              rules={[{ 
                required: true, 
                message: 'Please configure at least one parallax layer!',
                validator: (_, value) => {
                  if (!value || !value.layers || value.layers.length === 0) {
                    return Promise.reject(new Error('At least one layer is required'));
                  }
                  const hasValidLayer = value.layers.some((layer: any) => layer.imageUrl);
                  if (!hasValidLayer) {
                    return Promise.reject(new Error('At least one layer must have an image'));
                  }
                  return Promise.resolve();
                }
              }]}
            >
              <ParallaxLayersUpload />
            </Form.Item>
          )}

          <Form.Item
            name="tags"
            label="Tags"
            tooltip="Separate tags with commas"
          >
            <Input placeholder="e.g. nature, landscape, mountains" />
          </Form.Item>

          <Space>
            <Form.Item name="featured" valuePropName="checked">
              <Switch checkedChildren="Featured" unCheckedChildren="Normal" />
            </Form.Item>
            <Form.Item name="active" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Space>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingWallpaper ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Wallpapers;