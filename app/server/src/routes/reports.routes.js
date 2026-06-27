const express = require('express');
const {
  getDealerVisitReport,
  getSalesmanPerformance,
  getMonthlySummary,
  getDealerCoverage,
  getPurposeAnalysis,
  getBmVsSalesman,
} = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/dealer-visits', authenticate, getDealerVisitReport);
router.get('/salesman-performance', authenticate, getSalesmanPerformance);
router.get('/monthly-summary', authenticate, getMonthlySummary);
router.get('/dealer-coverage', authenticate, getDealerCoverage);
router.get('/purpose-analysis', authenticate, getPurposeAnalysis);
router.get('/bm-vs-salesman', authenticate, getBmVsSalesman);

module.exports = router;