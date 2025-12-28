import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../services/api';

const DocumentUploader = ({ onUploadSuccess, userId = 'anonymous' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'No file selected' };

    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(extension)) {
      return {
        valid: false,
        error: `File type not allowed. Supported: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit'
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file) => {
    setError(null);
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadDocument(selectedFile, userId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onUploadSuccess(result);
        setSelectedFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 500);
      
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer transition-all ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl transition-opacity ${
          isDragging ? 'opacity-75' : 'opacity-50 group-hover:opacity-75'
        }`}></div>
        
        <div className={`relative bg-black/40 backdrop-blur-xl border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
          isDragging ? 'border-purple-500 scale-105' : 'border-white/20 hover:border-purple-500/50'
        }`}>
          <Upload className={`w-16 h-16 text-purple-400 mx-auto mb-4 transition-transform ${
            isDragging ? 'scale-125' : 'group-hover:scale-110'
          }`} />
          
          <h3 className="text-2xl font-bold text-white mb-2">
            {isDragging ? 'Drop your document here' : 'Upload Legal Document'}
          </h3>
          
          <p className="text-gray-400 mb-6">
            Drag & drop or click to browse • PDF, JPG, PNG • Max 10MB
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium shadow-lg shadow-purple-500/50">
            <Upload className="w-5 h-5" />
            Choose File
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-semibold mb-1">Upload Error</h4>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <File className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold mb-1 truncate">{selectedFile.name}</h4>
              <p className="text-gray-400 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {!uploading && (
              <button
                onClick={handleRemove}
                className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Uploading & Processing...</span>
                <span className="text-sm text-purple-400 font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {!uploading && (
            <button
              onClick={handleUpload}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium shadow-lg shadow-purple-500/50 transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload & Process Document
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;