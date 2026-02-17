import express from 'express';
import { body } from 'express-validator';
import {
  logStress,
  getStressHistory,
  getCurrentStress
} from '../controllers/stressController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const logStressValidation = [
  body('stressLevel').isInt({ min: 1, max: 10 }).withMessage('Stress level must be between 1 and 10'),
  body('notes').optional().trim()
];

router.use(protect); // All routes require authentication

router.post('/', logStressValidation, handleValidationErrors, logStress);
router.get('/', getStressHistory);
router.get('/current', getCurrentStress);

export default router;
