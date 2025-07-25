import React, { useState, useEffect } from 'react';
import {
  Card, Form, Space, Button, InputNumber, Slider, Switch,
  Typography, Row, Col, message, Tooltip
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EyeOutlined,
  AppstoreOutlined, SettingOutlined
} from '@ant-design/icons';
import FileUpload from './FileUpload';
import type { ParallaxLayer, ParallaxSettings } from '../types/interfaces';

const { Title, Text } = Typography;

interface ParallaxLayersUploadProps {
  value?: ParallaxSettings;
  onChange?: (value: ParallaxSettings) => void;
}

const defaultLayer: Omit<ParallaxLayer, 'imageUrl'> = {
  zIndex: 1,
  moveSpeed: 1.0,
  blurAmount: 0,
  opacity: 1.0,
};

const defaultSettings: ParallaxSettings = {
  sensitivity: 0.1,
  parallaxStrength: 15,
  invertX: false,
  invertY: false,
  layers: [],
};

const ParallaxLayersUpload: React.FC<ParallaxLayersUploadProps> = ({
  value = defaultSettings,
  onChange,
}) => {
  const [settings, setSettings] = useState<ParallaxSettings>(value);

  useEffect(() => {
    setSettings(value);
  }, [value]);

  const updateSettings = (newSettings: ParallaxSettings) => {
    setSettings(newSettings);
    onChange?.(newSettings);
  };

  const addLayer = () => {
    if (settings.layers.length >= 3) {
      message.warning('Maximum 3 layers allowed for parallax wallpapers');
      return;
    }

    const newLayer: ParallaxLayer = {
      ...defaultLayer,
      imageUrl: '',
      zIndex: settings.layers.length + 1,
      moveSpeed: settings.layers.length === 0 ? 1.0 : 0.8 - (settings.layers.length * 0.2),
    };

    updateSettings({
      ...settings,
      layers: [...settings.layers, newLayer],
    });
  };

  const removeLayer = (index: number) => {
    if (settings.layers.length <= 1) {
      message.warning('At least one layer is required');
      return;
    }

    const newLayers = settings.layers.filter((_, i) => i !== index);
    updateSettings({
      ...settings,
      layers: newLayers,
    });
  };

  const updateLayer = (index: number, updates: Partial<ParallaxLayer>) => {
    const newLayers = settings.layers.map((layer, i) =>
      i === index ? { ...layer, ...updates } : layer
    );
    updateSettings({
      ...settings,
      layers: newLayers,
    });
  };

  const getLayerName = (zIndex: number) => {
    switch (zIndex) {
      case 1: return 'Foreground';
      case 2: return 'Middle Layer';
      case 3: return 'Background';
      default: return `Layer ${zIndex}`;
    }
  };

  const getLayerColor = (zIndex: number) => {
    switch (zIndex) {
      case 1: return '#1890ff';
      case 2: return '#52c41a';
      case 3: return '#faad14';
      default: return '#d9d9d9';
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <AppstoreOutlined style={{ marginRight: 8 }} />
            Multi-Layer Parallax Setup
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={addLayer}
            disabled={settings.layers.length >= 3}
          >
            Add Layer ({settings.layers.length}/3)
          </Button>
        </div>

        {/* Global Settings */}
        <Card size="small" title={<><SettingOutlined /> Global Parallax Settings</>}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Sensitivity">
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={settings.sensitivity}
                  onChange={(value) => updateSettings({ ...settings, sensitivity: value })}
                  marks={{
                    0.1: '0.1',
                    0.5: '0.5',
                    1.0: '1.0'
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Parallax Strength (px)">
                <Slider
                  min={10}
                  max={50}
                  step={5}
                  value={settings.parallaxStrength}
                  onChange={(value) => updateSettings({ ...settings, parallaxStrength: value })}
                  marks={{
                    10: '10',
                    30: '30',
                    50: '50'
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Invert X">
                <Switch
                  checked={settings.invertX}
                  onChange={(checked) => updateSettings({ ...settings, invertX: checked })}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Invert Y">
                <Switch
                  checked={settings.invertY}
                  onChange={(checked) => updateSettings({ ...settings, invertY: checked })}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Layers */}
        {settings.layers.length === 0 ? (
          <Card 
            style={{ 
              textAlign: 'center', 
              border: '2px dashed #d9d9d9',
              backgroundColor: '#fafafa'
            }}
          >
            <div style={{ padding: '40px 20px' }}>
              <AppstoreOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Title level={4} style={{ color: '#999' }}>No Layers Added</Title>
              <Text type="secondary">
                Add at least one layer to create a parallax wallpaper. <br/>
                Layer 1 is required, layers 2-3 are optional.
              </Text>
              <br />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={addLayer}
                style={{ marginTop: 16 }}
              >
                Add First Layer
              </Button>
            </div>
          </Card>
        ) : (
          settings.layers.map((layer, index) => (
            <Card
              key={index}
              size="small"
              title={
                <Space>
                  <div 
                    style={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: getLayerColor(layer.zIndex) 
                    }} 
                  />
                  <span>{getLayerName(layer.zIndex)}</span>
                  {index === 0 && <Text type="secondary">(Required)</Text>}
                  {index > 0 && <Text type="secondary">(Optional)</Text>}
                </Space>
              }
              extra={
                <Space>
                  <Tooltip title="Preview">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      disabled={!layer.imageUrl}
                    />
                  </Tooltip>
                  <Tooltip title="Remove Layer">
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => removeLayer(index)}
                      disabled={settings.layers.length <= 1}
                    />
                  </Tooltip>
                </Space>
              }
            >
              <Row gutter={16}>
                {/* Image Upload */}
                <Col span={8}>
                  <Form.Item 
                    label="Layer Image"
                    required={index === 0}
                  >
                    <FileUpload
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      maxSize={10}
                      listType="picture-card"
                      value={layer.imageUrl}
                      onChange={(url) => updateLayer(index, { imageUrl: url })}
                    />
                  </Form.Item>
                </Col>

                {/* Layer Settings */}
                <Col span={16}>
                  <Row gutter={12}>
                    <Col span={6}>
                      <Form.Item label="Z-Index">
                        <InputNumber
                          min={1}
                          max={3}
                          value={layer.zIndex}
                          onChange={(value) => updateLayer(index, { zIndex: value || 1 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Move Speed">
                        <InputNumber
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          value={layer.moveSpeed}
                          onChange={(value) => updateLayer(index, { moveSpeed: value || 1.0 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Blur Amount">
                        <InputNumber
                          min={0}
                          max={10}
                          step={0.5}
                          value={layer.blurAmount}
                          onChange={(value) => updateLayer(index, { blurAmount: value || 0 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Opacity">
                        <InputNumber
                          min={0.1}
                          max={1.0}
                          step={0.1}
                          value={layer.opacity}
                          onChange={(value) => updateLayer(index, { opacity: value || 1.0 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Text type="secondary" style={{ fontSize: 12 }}>
                    💡 Lower Z-index = closer to user. Move speed affects parallax intensity. 
                    Blur creates depth. Opacity allows layer blending.
                  </Text>
                </Col>
              </Row>
            </Card>
          ))
        )}

        {/* Help Text */}
        <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Text style={{ fontSize: 12, color: '#52c41a' }}>
            <strong>💡 Tips:</strong><br/>
            • Layer 1 (Foreground): Main subject, should be sharp and clear<br/>
            • Layer 2 (Middle): Secondary elements, moderate blur for depth<br/>
            • Layer 3 (Background): Distant elements, higher blur for atmospheric perspective<br/>
            • Higher move speed = more parallax movement. Lower Z-index = closer to viewer.
          </Text>
        </Card>
      </Space>
    </Card>
  );
};

export default ParallaxLayersUpload;