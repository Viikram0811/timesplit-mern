import express from 'express';
import multer from 'multer';
import { uploadPdf } from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Store files in memory; we only need the buffer for parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

router.use(protect);

router.post('/upload', upload.single('file'), uploadPdf);

export default router;

