"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploader({ 
  onImagesChange, 
  maxImages = 3,
  maxSizeMB = 2 
}: ImageUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{
    file: File;
    preview: string;
    url?: string;
    progress: number;
  }>>([]);

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      alert(`最多上传 ${maxImages} 张图片`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 计算缩放比例（最大 1920px）
        const maxWidth = 1920;
        const maxHeight = 1920;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob!);
          },
          'image/jpeg',
          0.8 // 80% 质量
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (imageFile: File): Promise<string> => {
    if (!user) throw new Error('请先登录');

    // 压缩图片
    const compressedBlob = await compressImage(imageFile);
    const compressedFile = new File([compressedBlob], imageFile.name, {
      type: 'image/jpeg',
    });

    // 检查大小
    if (compressedFile.size > 2 * 1024 * 1024) {
      throw new Error('图片大小不能超过 2MB');
    }

    // 创建 Supabase 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomStr}.jpg`;
    const path = `${user.id}/${fileName}`;

    // 上传
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(path, compressedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleUpload = async () => {
    if (!user || images.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        if (image.url) {
          // 已上传
          uploadedUrls.push(image.url);
          continue;
        }

        try {
          const url = await uploadImage(image.file);
          uploadedUrls.push(url);

          // 更新进度
          setImages(prev => prev.map((img, idx) => 
            idx === i ? { ...img, url, progress: 100 } : img
          ));
        } catch (error: any) {
          alert(`图片 ${i + 1} 上传失败：${error.message}`);
        }
      }

      // 通知父组件
      onImagesChange(uploadedUrls);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 选择图片按钮 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelectFiles}
        className="hidden"
        disabled={uploading || images.length >= maxImages}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || images.length >= maxImages}
        className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="选择图片"
      >
        📷
      </button>
      
      {/* 图片计数 */}
      {images.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages}
        </span>
      )}

      {/* 图片预览（小缩略图） */}
      {images.length > 0 && (
        <div className="flex items-center gap-1">
          {images.map((image, index) => (
            <div key={index} className="relative w-10 h-10">
              <img
                src={image.preview}
                alt={`预览 ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
              
              {/* 删除按钮 */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                title="删除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮（仅在有未上传图片时显示） */}
      {images.some(img => !img.url) && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {uploading ? '上传中...' : `上传 (${images.length})`}
        </button>
      )}
    </div>
  );
}
