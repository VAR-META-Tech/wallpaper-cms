import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Image, Input, Modal, Form,
  Card, Typography, Switch, message, Popconfirm, Tooltip, Statistic, Select, Tag
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { categoryApi } from '../services/api';
import type { Category } from '../types/interfaces';
import type { ColumnsType } from 'antd/es/table';
import FileUpload from '../components/FileUpload';

const { Search } = Input;
const { Title } = Typography;
const { Option } = Select;

// Category types with prefixes
const CATEGORY_TYPES = {
  WALLPAPER: { label: 'Wallpaper', prefix: '', color: 'blue' },
  QUOTE: { label: 'Quote', prefix: 'QT_', color: 'green' },
  STOCK: { label: 'Stock', prefix: 'ST_', color: 'orange' }
} as const;

type CategoryType = keyof typeof CATEGORY_TYPES;

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<CategoryType | 'ALL'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryType, setSelectedCategoryType] = useState<CategoryType>('WALLPAPER');
  const [form] = Form.useForm();

  // Utility functions for category types
  const getCategoryType = (categoryName: string): CategoryType => {
    if (categoryName.startsWith('QT_')) return 'QUOTE';
    if (categoryName.startsWith('ST_')) return 'STOCK';
    return 'WALLPAPER';
  };

  const getCategoryDisplayName = (categoryName: string): string => {
    const type = getCategoryType(categoryName);
    const prefix = CATEGORY_TYPES[type].prefix;
    return prefix ? categoryName.replace(prefix, '') : categoryName;
  };

  const getFullCategoryName = (displayName: string, type: CategoryType): string => {
    const prefix = CATEGORY_TYPES[type].prefix;
    return prefix + displayName;
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data.data);
    } catch (error) {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      category.id.toLowerCase().includes(searchText.toLowerCase()) ||
      getCategoryDisplayName(category.name).toLowerCase().includes(searchText.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || getCategoryType(category.name) === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    try {
      await categoryApi.delete(id);
      message.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await categoryApi.toggleActive(id);
      message.success('Status updated successfully');
      loadCategories();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const type = getCategoryType(category.name);
    const displayName = getCategoryDisplayName(category.name);
    
    setSelectedCategoryType(type);
    form.setFieldsValue({
      ...category,
      name: displayName, // Show display name without prefix in form
      categoryType: type
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setSelectedCategoryType('WALLPAPER');
    form.resetFields();
    form.setFieldsValue({ categoryType: 'WALLPAPER' });
    setModalVisible(true);
  };

  const handleModalSubmit = async (values: any) => {
    try {
      const { name, categoryType, ...otherValues } = values;
      const fullCategoryName = getFullCategoryName(name, categoryType);
      
      const categoryData = {
        ...otherValues,
        name: fullCategoryName
      };

      if (editingCategory) {
        await categoryApi.update(editingCategory.id, categoryData);
        message.success('Category updated successfully');
      } else {
        await categoryApi.create(categoryData);
        message.success('Category created successfully');
      }
      setModalVisible(false);
      loadCategories();
    } catch (error) {
      message.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
  };

  const columns: ColumnsType<Category> = [
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
      render: (text: string, record: Category) => {
        const type = getCategoryType(text);
        const displayName = getCategoryDisplayName(text);
        const typeConfig = CATEGORY_TYPES[type];
        
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{displayName}</span>
              <Tag color={typeConfig.color} style={{ fontSize: '11px' }}>
                {typeConfig.label}
              </Tag>
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              ID: {record.id} | Full name: {text}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Wallpaper Count',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
      render: (count: number) => (
        <Statistic
          value={count}
          valueStyle={{ fontSize: '14px' }}
          suffix="wallpapers"
        />
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
      render: (active: boolean, record: Category) => (
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
      width: 120,
      render: (_, record: Category) => (
        <Space size="small">
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
            title="Delete category"
            description="Are you sure to delete this category? This may affect wallpapers using this category."
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

  const totalWallpapers = categories.reduce((sum, cat) => sum + cat.count, 0);
  const activeCategories = categories.filter(cat => cat.active).length;
  
  // Category type statistics
  const wallpaperCategories = categories.filter(cat => getCategoryType(cat.name) === 'WALLPAPER');
  const quoteCategories = categories.filter(cat => getCategoryType(cat.name) === 'QUOTE');
  const stockCategories = categories.filter(cat => getCategoryType(cat.name) === 'STOCK');

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Categories Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Category
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Card size="small" style={{ minWidth: '150px' }}>
            <Statistic
              title="Total Categories"
              value={categories.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '150px' }}>
            <Statistic
              title="Active Categories"
              value={activeCategories}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '150px' }}>
            <Statistic
              title="Total Content"
              value={totalWallpapers}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '150px' }}>
            <Statistic
              title="Wallpaper Categories"
              value={wallpaperCategories.length}
              valueStyle={{ color: CATEGORY_TYPES.WALLPAPER.color }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '150px' }}>
            <Statistic
              title="Quote Categories"
              value={quoteCategories.length}
              valueStyle={{ color: CATEGORY_TYPES.QUOTE.color }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '150px' }}>
            <Statistic
              title="Stock Categories"
              value={stockCategories.length}
              valueStyle={{ color: CATEGORY_TYPES.STOCK.color }}
            />
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Search
              placeholder="Search categories..."
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={e => handleSearch(e.target.value)}
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 150 }}
              placeholder="Filter by type"
            >
              <Option value="ALL">All Types</Option>
              {Object.entries(CATEGORY_TYPES).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Tag color={config.color} style={{ margin: 0 }}>
                    {config.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredCategories.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 800 }}
        />
      </Space>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
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
            name="categoryType"
            label="Category Type"
            rules={[{ required: true, message: 'Please select category type!' }]}
          >
            <Select
              value={selectedCategoryType}
              onChange={(value: CategoryType) => setSelectedCategoryType(value)}
              placeholder="Select category type"
            >
              {Object.entries(CATEGORY_TYPES).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space>
                    <Tag color={config.color} style={{ margin: 0 }}>
                      {config.label}
                    </Tag>
                    {config.prefix && (
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        (Prefix: {config.prefix})
                      </span>
                    )}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please input category name!' },
              { min: 2, message: 'Name must be at least 2 characters!' },
              { max: 50, message: 'Name must not exceed 50 characters!' }
            ]}
            extra={
              selectedCategoryType && CATEGORY_TYPES[selectedCategoryType].prefix && (
                <span style={{ color: '#666', fontSize: '12px' }}>
                  Full name will be: <strong>{CATEGORY_TYPES[selectedCategoryType].prefix}[your-input]</strong>
                </span>
              )
            }
          >
            <Input placeholder="e.g. Nature, Abstract, Urban" />
          </Form.Item>

          <Form.Item
            name="thumbnailUrl"
            label="Thumbnail Image"
            rules={[
              { required: true, message: 'Please upload a thumbnail image!' }
            ]}
          >
            <FileUpload
              accept=".jpg,.jpeg,.png,.webp"
              maxSize={5}
              listType="picture-card"
            />
          </Form.Item>

          <Form.Item name="active" valuePropName="checked" initialValue={true}>
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
            />
            <span style={{ marginLeft: 8 }}>Category Status</span>
          </Form.Item>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Categories;