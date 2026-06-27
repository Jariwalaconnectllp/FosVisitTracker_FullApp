const express = require('express');
const { body } = require('express-validator');
const {
  getMyTargets,
  getTeamTargets,
  setTarget,
  setBulkTargets,
} = require('../controllers/targets.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/my', authenticate, getMyTargets);
router.get('/team', authenticate, requireRole('BM', 'ADMIN'), getTeamTargets);
router.post('/', authenticate, requireRole('BM', 'ADMIN'), [
  body('salesmanId').notEmpty(),
  body('targetMonth').isInt({ min: 1, max: 12 }),
  body('targetYear').isInt(),
  body('targetCount').isInt({ min: 0 }),
], setTarget);
router.post('/bulk', authenticate, requireRole('BM', 'ADMIN'), setBulkTargets);

module.exports = router;