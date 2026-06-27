const express = require('express');
const { body } = require('express-validator');
const {
  createVisit,
  getVisits,
  getVisitById,
  updateVisit,
  deleteVisit,
  getDashboardStats,
} = require('../controllers/visits.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/', authenticate, upload.single('photo'), [
  body('dealerId').notEmpty(),
  body('visitDate').isDate(),
  body('remarks').optional().isLength({ min: 20 }),
], createVisit);

router.get('/', authenticate, getVisits);
router.get('/dashboard-stats', authenticate, getDashboardStats);
router.get('/:id', authenticate, getVisitById);
router.patch('/:id', authenticate, upload.single('photo'), updateVisit);
router.delete('/:id', authenticate, deleteVisit);

module.exports = router;