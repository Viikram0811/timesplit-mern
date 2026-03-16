import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';
import SplitText from '../components/reactbits/SplitText';
import FadeInStagger from '../components/reactbits/FadeInStagger';
import {
  IconUpload,
  IconFile,
  IconFilePdf,
  IconFileWord,
  IconFileText,
  IconDelete,
  IconSuccess,
  IconAlert,
} from '../components/common/Icons';

const Resources = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState([]);

  useEffect(() => {
    loadSupportedTypes();
  }, []);

  const loadSupportedTypes = async () => {
    try {
      const types = await resourceService.getSupportedTypes();
      setSupportedTypes(types);
    } catch (error) {
      console.error('Failed to load supported types:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      file,
      id: Math.random(),
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0 || uploading) return;

    setUploading(true);
    const filesToUpload = files.filter((f) => f.status === 'pending');

    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => {
        formData.append('files', f.file);
      });

      const res = await resourceService.uploadMultipleFiles(formData);

      // Update file statuses
      setFiles((prev) =>
        prev.map((f) => {
          const uploaded = res.uploadedFiles?.find((uf) => uf.fileName === f.file.name);
          return { ...f, status: uploaded ? 'success' : 'error' };
        })
      );

      if (res.uploadedCount > 0) {
        toast.success(res.message);
      }
      if (res.errors?.length > 0) {
        res.errors.forEach((err) => {
          toast.error(`${err.fileName}: ${err.error}`);
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to upload files';
      toast.error(msg);
      setFiles((prev) =>
        prev.map((f) => (f.status === 'pending' ? { ...f, status: 'error' } : f))
      );
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <IconFilePdf className="w-4 h-4 text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <IconFileWord className="w-4 h-4 text-blue-500" />;
    if (ext === 'txt') return <IconFileText className="w-4 h-4 text-gray-500" />;
    return <IconFile className="w-4 h-4 text-gray-400" />;
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <SplitText
          text="📚 Study Resources Library"
          as="h1"
          className="text-3xl font-bold text-gray-900"
          delay={35}
          duration={0.7}
        />
        <p className="text-gray-600">
          Upload your study materials (PDF, Word documents, text files, etc.). The AI chatbot will
          use this content as a knowledge base to give more personalized and accurate answers.
        </p>

        {/* Upload Area */}
        <FadeInStagger as="div" className="card bg-white shadow-lg border border-gray-200" delay={0.1}>
          <div className="card-body">
            <h2 className="card-title text-gray-900 flex items-center gap-2">
              <IconUpload className="w-5 h-5" />
              Upload Files
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.csv,.json,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <IconUpload className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                  <p className="text-gray-900 font-semibold">
                    Drag files here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports: PDF, Word, Text, CSV, JSON, PowerPoint (Max 50MB per file)
                  </p>
                </label>
              </div>

              {/* Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                      Selected Files ({files.length})
                    </h3>
                    {files.length > 0 && (
                      <button
                        type="button"
                        onClick={clearFiles}
                        className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(f.file.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {f.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(f.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {f.status === 'success' && (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <IconSuccess className="w-4 h-4" />
                              Uploaded
                            </span>
                          )}
                          {f.status === 'error' && (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <IconAlert className="w-4 h-4" />
                              Error
                            </span>
                          )}
                          {f.status === 'pending' && (
                            <span className="text-xs text-gray-500">Pending</span>
                          )}
                          {f.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => removeFile(f.id)}
                              className="btn btn-sm btn-ghost text-red-500"
                            >
                              <IconDelete className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pendingCount === 0 || uploading}
                  className="btn btn-primary flex-1"
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <IconUpload className="w-4 h-4" />
                      Upload {pendingCount > 0 ? `(${pendingCount})` : ''}
                    </>
                  )}
                </button>
              </div>

              {/* Statistics */}
              {(successCount > 0 || errorCount > 0) && (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {successCount > 0 && (
                    <div className="p-2 bg-green-50 rounded text-center">
                      <p className="font-semibold text-green-700">{successCount}</p>
                      <p className="text-xs text-green-600">Uploaded</p>
                    </div>
                  )}
                  {errorCount > 0 && (
                    <div className="p-2 bg-red-50 rounded text-center">
                      <p className="font-semibold text-red-700">{errorCount}</p>
                      <p className="text-xs text-red-600">Failed</p>
                    </div>
                  )}
                  {pendingCount > 0 && (
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <p className="font-semibold text-blue-700">{pendingCount}</p>
                      <p className="text-xs text-blue-600">Pending</p>
                    </div>
                  )}
                </div>
              )}

              <label className="label">
                <span className="label-text-alt text-gray-600">
                  💡 Tip: Upload multiple files at once for faster processing
                </span>
              </label>
            </form>
          </div>
        </FadeInStagger>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <FadeInStagger as="div" className="card bg-gradient-to-br from-blue-50 to-blue-100 shadow border border-blue-200" delay={0.15}>
            <div className="card-body">
              <h3 className="card-title text-blue-900 flex items-center gap-2 text-lg">
                <span>✨</span> How It Works
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Files are converted to plain text on the server</li>
                <li>✓ Content is appended to your knowledge base</li>
                <li>✓ AI chatbot references your documents</li>
                <li>✓ Get personalized answers based on your materials</li>
              </ul>
            </div>
          </FadeInStagger>

          <FadeInStagger as="div" className="card bg-gradient-to-br from-green-50 to-green-100 shadow border border-green-200" delay={0.2}>
            <div className="card-body">
              <h3 className="card-title text-green-900 flex items-center gap-2 text-lg">
                <span>📄</span> Supported Formats
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                <div>PDF Documents</div>
                <div>Word Files (.doc, .docx)</div>
                <div>Text Files</div>
                <div>PowerPoint Slides</div>
                <div>CSV/JSON Data</div>
                <div>And more...</div>
              </div>
            </div>
          </FadeInStagger>
        </div>

        {/* Benefits */}
        <FadeInStagger as="div" className="card bg-gradient-to-r from-purple-50 to-pink-50 shadow border border-purple-200" delay={0.25}>
          <div className="card-body">
            <h3 className="card-title text-purple-900 flex items-center gap-2 mb-4">
              <span>🎯</span> Why Upload Your Resources?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">📚 Personalized Learning</h4>
                <p className="text-purple-700">AI understands your specific study materials</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">🚀 Better Answers</h4>
                <p className="text-purple-700">Get answers tailored to your course content</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">💾 Easy Access</h4>
                <p className="text-purple-700">Organize all your study materials in one place</p>
              </div>
            </div>
          </div>
        </FadeInStagger>
      </div>
    </Layout>
  );
};

export default Resources;

