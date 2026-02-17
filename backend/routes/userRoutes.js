import express from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile, getAllUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('academicGoals').optional().trim(),
  body('availableHoursPerDay').optional().isInt({ min: 1, max: 24 }).withMessage('Available hours must be between 1 and 24'),
  body('preferredTimeSlots').optional().isArray().withMessage('Preferred time slots must be an array')
];

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, handleValidationErrors, updateProfile);
router.get('/', protect, authorize('Admin'), getAllUsers);

export default router;
