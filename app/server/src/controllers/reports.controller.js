const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDealerVisitReport = async (req, res) => {
  try {
    const { dealerId, month, year, fromDate, toDate } = req.query;

    if (!dealerId) {
      return res.status(400).json({ message: 'Dealer ID is required' });
    }

    const where = { dealerId };

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (fromDate || toDate) {
      where.visitDate = {};
      if (fromDate) where.visitDate.gte = new Date(fromDate);
      if (toDate) where.visitDate.lte = new Date(toDate);
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        visitor: { select: { id: true, name: true, role: true } },
        dealer: { select: { id: true, name: true, shopName: true } },
      },
      orderBy: { visitDate: 'desc' },
    });

    const summary = {
      totalVisits: visits.length,
      salesmanVisits: visits.filter((v) => v.visitorRole === 'SALESMAN').length,
      bmVisits: visits.filter((v) => v.visitorRole === 'BM').length,
      byPurpose: {},
    };

    visits.forEach((v) => {
      summary.byPurpose[v.purpose] = (summary.byPurpose[v.purpose] || 0) + 1;
    });

    res.json({ summary, visits });
  } catch (error) {
    console.error('Dealer visit report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSalesmanPerformance = async (req, res) => {
  try {
    const { salesmanId, fromMonth, fromYear, toMonth, toYear } = req.query;

    if (!salesmanId) {
      return res.status(400).json({ message: 'Salesman ID is required' });
    }

    const targets = await prisma.visitTarget.findMany({
      where: { salesmanId },
      orderBy: [{ targetYear: 'asc' }, { targetMonth: 'asc' }],
    });

    const performance = await Promise.all(
      targets.map(async (target) => {
        const visits = await prisma.visit.count({
          where: {
            visitorId: salesmanId,
            month: target.targetMonth,
            year: target.targetYear,
            status: 'COMPLETED',
          },
        });

        const uniqueDealers = await prisma.visit.groupBy({
          by: ['dealerId'],
          where: {
            visitorId: salesmanId,
            month: target.targetMonth,
            year: target.targetYear,
            status: 'COMPLETED',
          },
        });

        return {
          month: target.targetMonth,
          year: target.targetYear,
          target: target.targetCount,
          achieved: visits,
          achievement: target.targetCount ? Math.round((visits / target.targetCount) * 100) : 0,
          uniqueDealers: uniqueDealers.length,
        };
      })
    );

    res.json(performance);
  } catch (error) {
    console.error('Salesman performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const allSalesmen = await prisma.user.findMany({
      where: { role: 'SALESMAN' },
      select: { id: true, name: true, email: true },
    });

    const summary = await Promise.all(
      allSalesmen.map(async (salesman) => {
        const target = await prisma.visitTarget.findUnique({
          where: {
            salesmanId_targetMonth_targetYear: {
              salesmanId: salesman.id,
              targetMonth,
              targetYear,
            },
          },
        });

        const visits = await prisma.visit.count({
          where: {
            visitorId: salesman.id,
            month: targetMonth,
            year: targetYear,
            status: 'COMPLETED',
          },
        });

        const uniqueDealers = await prisma.visit.groupBy({
          by: ['dealerId'],
          where: {
            visitorId: salesman.id,
            month: targetMonth,
            year: targetYear,
            status: 'COMPLETED',
          },
        });

        return {
          salesman,
          target: target?.targetCount || 0,
          visits,
          achievement: target?.targetCount ? Math.round((visits / target.targetCount) * 100) : 0,
          uniqueDealers: uniqueDealers.length,
        };
      })
    );

    // Daily heatmap data
    const dailyVisits = await prisma.visit.groupBy({
      by: ['visitDate'],
      where: {
        month: targetMonth,
        year: targetYear,
        status: 'COMPLETED',
      },
      _count: { id: true },
    });

    res.json({ summary, dailyVisits });
  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDealerCoverage = async (req, res) => {
  try {
    const { month, year, filter } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const dealers = await prisma.dealer.findMany({
      where: { isActive: true },
      select: { id: true, name: true, shopName: true, city: true, category: true },
    });

    const coverage = await Promise.all(
      dealers.map(async (dealer) => {
        const visits = await prisma.visit.count({
          where: {
            dealerId: dealer.id,
            month: targetMonth,
            year: targetYear,
            status: 'COMPLETED',
          },
        });

        const lastVisit = await prisma.visit.findFirst({
          where: { dealerId: dealer.id, status: 'COMPLETED' },
          orderBy: { visitDate: 'desc' },
          select: { visitDate: true },
        });

        return {
          ...dealer,
          visitsThisMonth: visits,
          lastVisitDate: lastVisit?.visitDate || null,
          neverVisited: !lastVisit,
          lowFrequency: visits < 2,
        };
      })
    );

    let filtered = coverage;
    if (filter === 'never') {
      filtered = coverage.filter((c) => c.neverVisited);
    } else if (filter === 'low') {
      filtered = coverage.filter((c) => c.lowFrequency);
    }

    res.json(filtered.sort((a, b) => b.visitsThisMonth - a.visitsThisMonth));
  } catch (error) {
    console.error('Dealer coverage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPurposeAnalysis = async (req, res) => {
  try {
    const { salesmanId, month, year } = req.query;

    const where = { status: 'COMPLETED' };
    if (salesmanId) where.visitorId = salesmanId;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const purposeCounts = await prisma.visit.groupBy({
      by: ['purpose'],
      where,
      _count: { id: true },
    });

    const total = purposeCounts.reduce((sum, p) => sum + p._count.id, 0);

    const analysis = purposeCounts.map((p) => ({
      purpose: p.purpose,
      count: p._count.id,
      percentage: total ? Math.round((p._count.id / total) * 100) : 0,
    }));

    res.json({ total, analysis });
  } catch (error) {
    console.error('Purpose analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBmVsSalesman = async (req, res) => {
  try {
    const { dealerId, month, year } = req.query;

    if (!dealerId) {
      return res.status(400).json({ message: 'Dealer ID is required' });
    }

    const where = { dealerId };
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const visits = await prisma.visit.findMany({
      where,
      include: {
        visitor: { select: { id: true, name: true, role: true } },
      },
      orderBy: { visitDate: 'desc' },
    });

    const monthlyStats = {};
    visits.forEach((v) => {
      const key = `${v.month}/${v.year}`;
      if (!monthlyStats[key]) {
        monthlyStats[key] = { salesman: 0, bm: 0 };
      }
      if (v.visitorRole === 'SALESMAN') {
        monthlyStats[key].salesman++;
      } else {
        monthlyStats[key].bm++;
      }
    });

    res.json({ monthlyStats, visits });
  } catch (error) {
    console.error('BM vs Salesman error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDealerVisitReport,
  getSalesmanPerformance,
  getMonthlySummary,
  getDealerCoverage,
  getPurposeAnalysis,
  getBmVsSalesman,
};