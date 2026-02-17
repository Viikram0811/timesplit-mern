import express from 'express';
import { body } from 'express-validator';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty')
];

router.use(protect); // All routes require authentication

// Apply rate limiter: 10 requests per minute per user
router.post('/', rateLimiter(10, 60000), sendMessageValidation, handleValidationErrors, sendMessage);
router.get('/', getChatHistory);
router.delete('/', clearChatHistory);

export default router;
