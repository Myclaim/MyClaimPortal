import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Trash2 } from 'lucide-react';
import { useUploadAnimation } from '../../hooks/useFormAnimations';

/**
 * ENHANCED DOCUMENT UPLOAD ZONE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium upload component with:
 * - Drag & drop with smooth animations
 * - Automatic progress animation
 * - Elegant file card reveals
 * - Success state with checkmark animation
 * - Responsive to dark theme
 * 
 * USAGE:
 * <DocumentUploadZone
 *   label="Upload Documents"
 *   hint="Drag and drop or click to upload"
 *   accept=".pdf,.jpg,.png"
 *   multiple
 *   onFilesSelected={(files) => handleFileUpload(files)}
 * />
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const DocumentUploadZone = ({
  label = 'Upload Documents',
  hint = 'Drag and drop your files here or click to upload',
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesSelected,
  onUploadComplete,
  staggerDelay = 0,
  initialFiles = [],
}) => {
  const {
    isDragging,
    uploadProgress,
    uploadedFiles,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    addFileCard,
    removeFileCard,
    animateProgress,
    setUploadProgress,
  } = useUploadAnimation();

  const inputRef = React.useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFiles = useCallback(
    (files) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (file.size > maxSize) {
          alert(`File ${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        animateProgress(85);

        // Add file cards with animation stagger
        validFiles.forEach((file, index) => {
          setTimeout(() => {
            addFileCard(file.name, file.size);
          }, index * 150);
        });

        // Simulate completion
        setTimeout(() => {
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            onUploadComplete?.();
          }, 500);
        }, 1500);

        // Call callback with files
        onFilesSelected?.(validFiles);
      }
    },
    [maxSize, onFilesSelected, onUploadComplete, animateProgress, addFileCard, setUploadProgress]
  );

  const handleDropZone = (e) => {
    const files = handleDrop(e);
    if (files) {
      handleFiles(files);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: `fieldStaggerIn 350ms cubic-bezier(0.16, 1, 0.3, 1) backwards`,
        animationDelay: `${staggerDelay * 50}ms`,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-muted, #64748b)',
          }}
        >
          {label}
        </label>
      )}

      {/* UPLOAD ZONE */}
      <div
        ref={inputRef}
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropZone}
        onClick={() => document.getElementById(`file-input-${Date.now()}`).click()}
        style={{
          border: '2px dashed rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: isDragging ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.03)',
          borderColor: isDragging ? 'var(--blue, #10b981)' : 'rgba(16, 185, 129, 0.3)',
          animation: isUploading ? 'uploadZoneGlow 1s ease-out infinite' : 'none',
        }}
      >
        {/* UPLOAD ICON */}
        <div
          className="upload-zone-icon"
          style={{
            fontSize: '32px',
            marginBottom: '8px',
            display: 'block',
            animation: isUploading ? 'spin 2s linear infinite' : 'none',
          }}
        >
          <Upload size={32} color="var(--text-muted)" />
        </div>

        {/* UPLOAD TEXT */}
        <div
          className="upload-zone-text"
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text, #ffffff)',
          }}
        >
          {isUploading ? 'Uploading...' : 'Drag and drop files here'}
        </div>

        {/* UPLOAD HINT */}
        <div
          className="upload-zone-hint"
          style={{
            fontSize: '12px',
            color: 'var(--text-muted, #9ca3af)',
            marginTop: '4px',
          }}
        >
          {hint}
        </div>

        {/* PROGRESS BAR */}
        {isUploading && (
          <div
            className="upload-progress-bar"
            style={{
              height: '4px',
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: '2px',
              marginTop: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              className="upload-progress-fill"
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--blue, #10b981), #22c55e)',
                borderRadius: '2px',
                width: `${uploadProgress}%`,
                animation: `uploadProgressReveal 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                '--upload-progress': `${uploadProgress}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* HIDDEN FILE INPUT */}
      <input
        id={`file-input-${Date.now()}`}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* UPLOADED FILES */}
      {uploadedFiles.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {uploadedFiles.map((file, idx) => (
            <FileCard
              key={file.id}
              file={file}
              onRemove={() => removeFileCard(file.id)}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * FILE CARD COMPONENT
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Individual file card with animation and removal button.
 */
const FileCard = ({ file, onRemove, index }) => {
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📘',
      docx: '📘',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      xlsx: '📊',
      csv: '📊',
    };
    return iconMap[ext] || '📎';
  };

  return (
    <div
      className="file-card"
      style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: '10px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: `fileCardSlideIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div
        className="file-card-info"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          className="file-card-icon"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--blue, #10b981)',
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {getFileIcon(file.name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="file-card-name"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text, #ffffff)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={file.name}
          >
            {file.name}
          </div>
          <div
            className="file-card-size"
            style={{
              fontSize: '11px',
              color: 'var(--text-muted, #9ca3af)',
            }}
          >
            {Math.round(file.size / 1024)} KB
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* SUCCESS CHECKMARK */}
        <div
          className="file-card-check"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--blue, #10b981)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '700',
            animation: 'uploadCheckmarkReveal 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          ✓
        </div>

        {/* REMOVE BUTTON */}
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #9ca3af)',
            transition: 'color 200ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #9ca3af)')}
          title="Remove file"
          aria-label="Remove file"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

/**
 * SIMPLE FILE UPLOAD FIELD
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Simple file upload field (not a drag-drop zone).
 * Useful for single file uploads in form fields.
 */
export const SimpleFileUpload = ({
  label,
  name,
  accept = '.pdf,.jpg,.jpeg,.png',
  value,
  onChange,
  error,
  required = false,
  staggerDelay = 0,
  disabled = false,
}) => {
  const fileInputRef = React.useRef(null);
  const [fileName, setFileName] = useState(value?.name || '');

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
      onChange?.(e);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        animation: `fieldStaggerIn 350ms cubic-bezier(0.16, 1, 0.3, 1) backwards`,
        animationDelay: `${staggerDelay * 50}ms`,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-muted, #64748b)',
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1.5px solid ${error ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'var(--bg, #f8fafc)',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '42px',
        }}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          style={{
            background: '#f1f5f9',
            border: 'none',
            borderRight: '1.5px solid var(--border, #e2e8f0)',
            padding: '9px 14px',
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: '600',
            color: '#000',
            cursor: disabled ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 200ms',
          }}
          onMouseEnter={(e) => !disabled && (e.target.style.background = '#e2e8f0')}
          onMouseLeave={(e) => !disabled && (e.target.style.background = '#f1f5f9')}
        >
          Choose File
        </button>

        <span
          style={{
            padding: '9px 12px',
            fontSize: '13px',
            color: fileName ? 'var(--text, #1e293b)' : 'var(--text-muted, #64748b)',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {fileName || 'No file chosen'}
        </span>

        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: '#ef4444',
            marginTop: '2px',
            animation: 'validationTextFadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <span>✕</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadZone;
