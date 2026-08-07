import { useState, useRef } from 'react';
import api from '../api/axios';

export default function FileUploadZone({ taskId, attachments, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const uploadFile = async (file) => {
    setError('');
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      onUpdated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
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
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = ''; // allow re-selecting the same file later
  };

  const handleDelete = async (attachmentId) => {
    try {
      const { data } = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      onUpdated(data);
    } catch (err) {
      console.error('Failed to delete attachment', err);
    }
  };

  const isImage = (name) => /\.(jpe?g|png|webp)$/i.test(name);

  return (
    <div className="space-y-3 antialiased">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-400">
          Attachments
        </label>
        {attachments?.length > 0 && (
          <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/50">
            {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
          </span>
        )}
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-zinc-800/90 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-medium px-1">
              <span>Uploading...</span>
              <span className="text-indigo-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <svg
              className="w-6 h-6 text-zinc-500 group-hover:text-zinc-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xs text-zinc-400 font-medium">
              Drag & drop a file here, or{' '}
              <span className="text-indigo-400 hover:underline">browse</span>
            </p>
            <p className="text-[10px] text-zinc-500">
              Supports JPG, PNG, WEBP, or PDF
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-xs text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* Attachment Grid */}
      {attachments?.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {attachments.map((att) => (
            <div
              key={att._id}
              className="relative group border border-zinc-800/80 bg-zinc-950/60 rounded-xl overflow-hidden hover:border-zinc-700/80 transition-all duration-200"
            >
              {isImage(att.name) ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-full h-20 object-cover"
                />
              ) : (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center h-20 p-2 text-center text-xs text-zinc-400 hover:text-indigo-300 hover:bg-zinc-900/80 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mb-1 text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="truncate w-full text-[10px] font-medium">
                    {att.name}
                  </span>
                </a>
              )}

              {/* Delete Button Overlay */}
              <button
                type="button"
                onClick={() => handleDelete(att._id)}
                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white rounded-lg p-1 backdrop-blur-md transition-all duration-150 opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete attachment"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}