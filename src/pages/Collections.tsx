import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Image, Input, Modal, Form,
  Card, Typography, Switch, message, Popconfirm, Tooltip,
  Transfer, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, PictureOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { collectionApi, wallpaperApi } from '../services/api';
import type { Collection, Wallpaper } from '../types/interfaces';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface TransferItem {
  key: string;
  title: string;
  description: string;
  chosen: boolean;
}

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [wallpaperModalVisible, setWallpaperModalVisible] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCollections();
    loadWallpapers();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionApi.getAll();
      setCollections(response.data.data);
    } catch (error) {
      message.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const loadWallpapers = async () => {
    try {
      const response = await wallpaperApi.getAll({ page: 1, limit: 100 });
      setWallpapers(response.data.data);
    } catch (error) {
      message.error('Failed to load wallpapers');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchText.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchText.toLowerCase()) ||
    collection.id.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await collectionApi.delete(id);
      message.success('Collection deleted successfully');
      loadCollections();
    } catch (error) {
      message.error('Failed to delete collection');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await collectionApi.toggleActive(id);
      message.success('Status updated successfully');
      loadCollections();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    form.setFieldsValue(collection);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingCollection(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (editingCollection) {
        await collectionApi.update(editingCollection.id, values);
        message.success('Collection updated successfully');
      } else {
        await collectionApi.create(values);
        message.success('Collection created successfully');
      }
      setModalVisible(false);
      loadCollections();
    } catch (error) {
      message.error(`Failed to ${editingCollection ? 'update' : 'create'} collection`);
    }
  };

  const handleManageWallpapers = (collection: Collection) => {
    setSelectedCollection(collection);
    setTargetKeys(collection.wallpapers || []);
    setWallpaperModalVisible(true);
  };

  const handleTransferChange = (newTargetKeys: React.Key[]) => {
    setTargetKeys(newTargetKeys as string[]);
  };

  const handleWallpaperModalSubmit = async () => {
    if (!selectedCollection) return;

    try {
      // Get current wallpapers in collection
      const currentWallpapers = selectedCollection.wallpapers || [];
      
      // Find wallpapers to add and remove
      const toAdd = targetKeys.filter(id => !currentWallpapers.includes(id));
      const toRemove = currentWallpapers.filter(id => !targetKeys.includes(id));

      // Add new wallpapers
      for (const wallpaperId of toAdd) {
        await collectionApi.addWallpaper(selectedCollection.id, wallpaperId);
      }

      // Remove old wallpapers
      for (const wallpaperId of toRemove) {
        await collectionApi.removeWallpaper(selectedCollection.id, wallpaperId);
      }

      message.success('Collection wallpapers updated successfully');
      setWallpaperModalVisible(false);
      loadCollections();
    } catch (error) {
      message.error('Failed to update collection wallpapers');
    }
  };

  const columns: ColumnsType<Collection> = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnail',
      width: 80,
      render: (url: string) => (
        <Image
          src={url}
          alt="thumbnail"
          width={50}
          height={35}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          placeholder={<div style={{ width: 50, height: 35, background: '#f0f0f0', borderRadius: 4 }} />}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Collection) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            ID: {record.id}
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Wallpapers',
      dataIndex: 'wallpapers',
      key: 'wallpapers',
      render: (wallpapers: string[] | null) => (
        <Space>
          <PictureOutlined />
          <span>{wallpapers?.length || 0} items</span>
        </Space>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'status',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active: boolean, record: Collection) => (
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
      render: (_, record: Collection) => (
        <Space size="small">
          <Tooltip title="Manage Wallpapers">
            <Button 
              type="text" 
              icon={<AppstoreOutlined />}
              onClick={() => handleManageWallpapers(record)}
            />
          </Tooltip>
          <Tooltip title="View Thumbnail">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => window.open(record.thumbnailUrl, '_blank')}
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
            title="Delete collection"
            description="Are you sure to delete this collection?"
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

  // Prepare transfer data
  const transferData: TransferItem[] = wallpapers.map(wallpaper => ({
    key: wallpaper.id,
    title: wallpaper.title,
    description: `${wallpaper.category} • ${wallpaper.type}`,
    chosen: false,
  }));

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Collections Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Collection
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Search
            placeholder="Search collections..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={e => handleSearch(e.target.value)}
          />
          <Space>
            <Text type="secondary">
              Total: {collections.length} collections
            </Text>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCollections}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredCollections.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
        />
      </Space>

      {/* Add/Edit Collection Modal */}
      <Modal
        title={editingCollection ? 'Edit Collection' : 'Add Collection'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="name"
            label="Collection Name"
            rules={[
              { required: true, message: 'Please input collection name!' },
              { min: 2, message: 'Name must be at least 2 characters!' },
              { max: 100, message: 'Name must not exceed 100 characters!' }
            ]}
          >
            <Input placeholder="e.g. Trending Wallpapers, Featured Collection" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please input description!' },
              { min: 10, message: 'Description must be at least 10 characters!' },
              { max: 500, message: 'Description must not exceed 500 characters!' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Describe what this collection contains and its purpose..."
            />
          </Form.Item>

          <Form.Item
            name="thumbnailUrl"
            label="Thumbnail URL"
            rules={[
              { required: true, message: 'Please input thumbnail URL!' },
              { type: 'url', message: 'Please enter a valid URL!' }
            ]}
          >
            <Input placeholder="https://example.com/thumbnail.jpg" />
          </Form.Item>

          <Form.Item name="active" valuePropName="checked" initialValue={true}>
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
            />
            <span style={{ marginLeft: 8 }}>Collection Status</span>
          </Form.Item>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingCollection ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Wallpapers Modal */}
      <Modal
        title={`Manage Wallpapers - ${selectedCollection?.name}`}
        open={wallpaperModalVisible}
        onCancel={() => setWallpaperModalVisible(false)}
        onOk={handleWallpaperModalSubmit}
        width={800}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Select wallpapers to include in this collection. Use the transfer component below to move wallpapers between available and selected lists.
          </Text>
        </div>
        
        <Transfer
          dataSource={transferData}
          titles={['Available Wallpapers', 'Selected Wallpapers']}
          targetKeys={targetKeys}
          onChange={handleTransferChange}
          render={item => (
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.title}</div>
                <div style={{ color: '#666', fontSize: '11px' }}>{item.description}</div>
              </div>
            </div>
          )}
          listStyle={{
            width: 350,
            height: 400,
          }}
          operations={['Add to Collection', 'Remove from Collection']}
          showSearch
          filterOption={(inputValue, option) =>
            option.title.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.description.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
        
        <Divider />
        <Text type="secondary">
          Selected: {targetKeys.length} wallpapers
        </Text>
      </Modal>
    </Card>
  );
};

export default Collections;