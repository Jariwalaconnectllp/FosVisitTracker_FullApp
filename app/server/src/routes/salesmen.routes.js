const express = require('express');
const { body } = require('express-validator');
const {
  getSalesmen,
  getSalesmanById,
  createSalesman,
  updateSalesman,
  toggleActive,
} = require('../controllers/salesmen.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, getSalesmen);
router.get('/:id', authenticate, getSalesmanById);
router.post('/', authenticate, requireRole('BM', 'ADMIN'), [
  body('name').notEmpty(),
  body('email').isEmail(),
], createSalesman);
router.patch('/:id', authenticate, requireRole('BM', 'ADMIN'), updateSalesman);
router.patch('/:id/toggle-active', authenticate, requireRole('BM', 'ADMIN'), toggleActive);

module.exports = router;