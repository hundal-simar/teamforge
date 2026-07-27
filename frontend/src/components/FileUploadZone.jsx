import { useState, useRef } from 'react';
import api from '../api/axios';

export default function FileUploadZone({ taskId, attachments, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
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

  const handleDrop = (e) => {
    e.preventDefault();
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
    <div className="mb-4">
      <label className="text-xs text-gray-500 block mb-2">Attachments</label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-sm text-gray-500 cursor-pointer hover:border-indigo-400"
      >
        {uploading ? `Uploading... ${progress}%` : 'Drag a file here or click to upload'}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {attachments?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {attachments.map((att) => (
            <div key={att._id} className="relative group">
              {isImage(att.name) ? (
                <img src={att.url} alt={att.name} className="w-full h-20 object-cover rounded" />
              ) : (
                  <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-20 bg-gray-100 rounded text-xs text-gray-500 px-2 text-center"
                >
                  {att.name}
                </a>
              )}
              <button
                onClick={() => handleDelete(att._id)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}