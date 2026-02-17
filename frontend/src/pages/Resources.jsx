import { useState } from 'react';
import Layout from '../components/common/Layout';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

const Resources = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (!e.target.files?.length) return;
    const selected = e.target.files[0];
    if (selected.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    try {
      const res = await resourceService.uploadPdf(file);
      toast.success(res.message || 'PDF uploaded successfully');
      setFile(null);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload PDF';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Study Resources</h1>
        <p className="text-gray-600">
          Upload your PDF study materials (notes, books, assignments). The AI chatbot will
          use this content as a knowledge base to give more personalized and accurate answers.
        </p>

        <form
          onSubmit={handleUpload}
          className="bg-white rounded-lg shadow p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0 file:text-sm file:font-semibold
                         file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Maximum size: 10MB. Only PDF files are supported.
            </p>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload & Index PDF'}
          </button>
        </form>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
          <h2 className="font-semibold mb-1">How it works</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Your PDF is converted to plain text on the server.</li>
            <li>The text is appended to your personal knowledge base file.</li>
            <li>When you chat with the AI, it first checks your knowledge base.</li>
            <li>If relevant information is found, it is given to Gemini to refine and answer.</li>
            <li>If not, Gemini answers from its own general knowledge.</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Resources;

