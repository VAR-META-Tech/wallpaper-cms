import React, { useState } from 'react';
import { Upload, message, Modal, Image } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadApi } from '../services/api';

interface FileUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  listType?: 'text' | 'picture' | 'picture-card';
  disabled?: boolean;
  allowVideo?: boolean; // Enable video upload for Live wallpapers
}

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  accept = '.jpg,.jpeg,.png,.gif,.webp',
  maxSize = 10,
  listType = 'picture-card',
  disabled = false,
  allowVideo = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const beforeUpload = (file: RcFile) => {
    // Define allowed types based on allowVideo flag
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv'];
    const allowedTypes = allowVideo ? [...imageTypes, ...videoTypes] : imageTypes;
    
    const isValidType = allowedTypes.includes(file.type);
    
    if (!isValidType) {
      const typeMessage = allowVideo 
        ? 'Invalid file type! Only JPG, PNG, GIF, WebP images and MP4, AVI, MOV, WebM, MKV videos are allowed.'
        : 'Invalid file type! Only JPG, PNG, GIF, and WebP images are allowed.';
      message.error(typeMessage);
      return false;
    }
    
    // Different size limits for video vs image
    const sizeLimit = allowVideo && videoTypes.includes(file.type) ? maxSize * 10 : maxSize; // 10x larger for video
    const isValidSize = file.size / 1024 / 1024 < sizeLimit;
    if (!isValidSize) {
      message.error(`File must be smaller than ${sizeLimit}MB!`);
      return false;
    }
    
    // Additional security check - validate file extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.webm', '.mkv'];
    const validExtensions = allowVideo ? [...imageExtensions, ...videoExtensions] : imageExtensions;
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      message.error('Invalid file extension!');
      return false;
    }
    
    return true;
  };

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setLoading(false);
      const response = info.file.response;
      if (response && response.success && response.data) {
        const uploadData: UploadResponse = response.data;
        onChange?.(uploadData.url);
        message.success('File uploaded successfully!');
      } else {
        message.error('Upload failed!');
      }
    }
    
    if (info.file.status === 'error') {
      setLoading(false);
      message.error('Upload failed!');
    }
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      setLoading(true);
      const response = await uploadApi.uploadFile(file as File);
      
      if (response.data.success) {
        const uploadData: UploadResponse = response.data.data;
        onChange?.(uploadData.url);
        message.success('File uploaded successfully!');
        onSuccess(response.data, file);
      } else {
        message.error('Upload failed!');
        onError(new Error('Upload failed'));
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data?.error || 'Upload failed!';
      message.error(errorMessage);
      onError(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (file: UploadFile) => {
    // Check if it's a video file
    const isVideo = file.type && file.type.startsWith('video/');
    
    if (isVideo) {
      // For videos, just use the URL or show a video preview
      setPreviewImage(file.url || '');
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
      return;
    }

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleCancel = () => setPreviewOpen(false);

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Convert current value to fileList format
  const fileList: UploadFile[] = value ? [{
    uid: '-1',
    name: 'current-file',
    status: 'done',
    url: value,
  }] : [];

  return (
    <>
      <Upload
        name="file"
        listType={listType}
        fileList={fileList}
        customRequest={customUpload}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        accept={accept}
        disabled={disabled}
        maxCount={1}
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>
      
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        {previewImage && previewImage.includes('.mp4') || previewImage.includes('.avi') || 
         previewImage.includes('.mov') || previewImage.includes('.webm') || previewImage.includes('.mkv') ? (
          <video
            controls
            style={{ width: '100%', maxHeight: '400px' }}
            src={previewImage}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            alt="preview"
            style={{ width: '100%' }}
            src={previewImage}
            preview={false}
          />
        )}
      </Modal>
    </>
  );
};

// Helper function to convert file to base64 for preview
const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default FileUpload;