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
        <h1 className="text-3xl font-bold text-base-content">Study Resources</h1>
        <p className="text-base-content/70">
          Upload your PDF study materials (notes, books, assignments). The AI chatbot will
          use this content as a knowledge base to give more personalized and accurate answers.
        </p>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Upload PDF</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt">Maximum size: 10MB. Only PDF files are supported.</span>
                </label>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="btn btn-primary"
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Uploading...
                    </>
                  ) : (
                    'Upload & Index PDF'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="font-bold">How it works</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Your PDF is converted to plain text on the server.</li>
              <li>The text is appended to your personal knowledge base file.</li>
              <li>When you chat with the AI, it first checks your knowledge base.</li>
              <li>If relevant information is found, it is given to Gemini to refine and answer.</li>
              <li>If not, Gemini answers from its own general knowledge.</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resources;

