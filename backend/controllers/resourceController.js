import { extractTextFromFile, validateFile, getFileSizeInMb, getSupportedFileTypes } from '../services/fileService.js';
import { appendKnowledge } from '../services/knowledgeService.js';

// @desc    Get supported file types
// @route   GET /api/resources/supported-types
// @access  Private
export const getSupportedTypes = async (req, res, next) => {
  try {
    const types = getSupportedFileTypes();
    const fileTypes = Object.entries(types).map(([mime, info]) => ({
      mime,
      ...info,
    }));

    res.status(200).json({
      success: true,
      data: fileTypes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple study resource files and add to user's knowledge base
// @route   POST /api/resources/upload
// @access  Private
export const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Validate file
        validateFile(file);

        // Extract text from file
        const text = await extractTextFromFile(file.buffer, file.mimetype, file.originalname);

        if (!text || !text.trim()) {
          errors.push({
            fileName: file.originalname,
            error: 'Could not extract text from file',
          });
          continue;
        }

        // Add to knowledge base
        await appendKnowledge(req.user.id, text, file.originalname);

        uploadedFiles.push({
          fileName: file.originalname,
          size: file.size,
          sizeMb: getFileSizeInMb(file.size),
          mimetype: file.mimetype,
        });
      } catch (fileError) {
        errors.push({
          fileName: file.originalname,
          error: fileError.message,
        });
      }
    }

    const message =
      uploadedFiles.length === req.files.length
        ? 'All files processed and added to your study knowledge base'
        : `${uploadedFiles.length} of ${req.files.length} files processed successfully`;

    res.status(201).json({
      success: uploadedFiles.length > 0,
      message,
      uploadedCount: uploadedFiles.length,
      totalCount: req.files.length,
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a single PDF file (legacy support)
// @route   POST /api/resources/upload-single
// @access  Private
export const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    validateFile(req.file);

    const text = await extractTextFromFile(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from file',
      });
    }

    await appendKnowledge(req.user.id, text, req.file.originalname);

    res.status(201).json({
      success: true,
      message: 'File processed and added to your study knowledge base',
      fileName: req.file.originalname,
      size: req.file.size,
      sizeMb: getFileSizeInMb(req.file.size),
    });
  } catch (error) {
    next(error);
  }
};

