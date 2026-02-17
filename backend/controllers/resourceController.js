import { extractTextFromPdfBuffer } from '../services/pdfService.js';
import { appendKnowledge } from '../services/knowledgeService.js';

// @desc    Upload a study resource PDF and add to user's knowledge base
// @route   POST /api/resources/upload
// @access  Private
export const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are supported',
      });
    }

    const pdfBuffer = req.file.buffer;
    const text = await extractTextFromPdfBuffer(pdfBuffer);

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF',
      });
    }

    await appendKnowledge(req.user.id, text, req.file.originalname);

    res.status(201).json({
      success: true,
      message: 'PDF processed and added to your study knowledge base',
      fileName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};

