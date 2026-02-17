import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createTaskValidation = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('deadline').isISO8601().withMessage('Please provide a valid deadline date'),
  body('estimatedTime').isInt({ min: 1 }).withMessage('Estimated time must be a positive number (in minutes)'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status')
];

const updateTaskValidation = [
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('deadline').optional().isISO8601().withMessage('Please provide a valid deadline date'),
  body('estimatedTime').optional().isInt({ min: 1 }).withMessage('Estimated time must be a positive number'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status')
];

router.use(protect); // All routes require authentication

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTaskValidation, handleValidationErrors, createTask);
router.put('/:id', updateTaskValidation, handleValidationErrors, updateTask);
router.delete('/:id', deleteTask);

export default router;
