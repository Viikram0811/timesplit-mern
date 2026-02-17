import express from 'express';
import { body } from 'express-validator';
import {
  generateUserSchedule,
  getSchedules,
  updateSchedule,
  rescheduleMissed
} from '../controllers/scheduleController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const generateScheduleValidation = [
  body('stressLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Stress level must be between 1 and 10')
];

const updateScheduleValidation = [
  body('status').isIn(['Scheduled', 'Completed', 'Missed', 'Rescheduled']).withMessage('Invalid status')
];

router.use(protect); // All routes require authentication

router.post('/generate', generateScheduleValidation, handleValidationErrors, generateUserSchedule);
router.get('/', getSchedules);
router.put('/:id', updateScheduleValidation, handleValidationErrors, updateSchedule);
router.post('/reschedule', rescheduleMissed);

export default router;
