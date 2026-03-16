import express from 'express';
import multer from 'multer';
import { uploadFiles, uploadPdf, getSupportedTypes } from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Store files in memory; we only need the buffer for parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file
  },
});

router.use(protect);

// Get supported file types
router.get('/supported-types', getSupportedTypes);

// Upload multiple files
router.post('/upload', upload.array('files', 10), uploadFiles);

// Single file upload (legacy)
router.post('/upload-single', upload.single('file'), uploadPdf);

export default router;

