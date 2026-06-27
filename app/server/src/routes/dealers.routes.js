const express = require('express');
const { body } = require('express-validator');
const {
  getDealers,
  getDealerById,
  createDealer,
  updateDealer,
  toggleDealerActive,
  assignDealer,
  unassignDealer,
} = require('../controllers/dealers.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, getDealers);
router.get('/:id', authenticate, getDealerById);
router.post('/', authenticate, requireRole('ADMIN', 'BM'), [
  body('name').notEmpty(),
], createDealer);
router.patch('/:id', authenticate, requireRole('ADMIN', 'BM'), updateDealer);
router.delete('/:id', authenticate, requireRole('ADMIN', 'BM'), toggleDealerActive);
router.post('/assign', authenticate, requireRole('ADMIN', 'BM'), assignDealer);
router.post('/unassign', authenticate, requireRole('ADMIN', 'BM'), unassignDealer);

module.exports = router;