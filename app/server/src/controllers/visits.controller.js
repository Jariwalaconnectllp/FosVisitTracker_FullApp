const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const createVisit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      dealerId,
      visitDate,
      visitTime,
      purpose,
      remarks,
      outcome,
      nextAction,
      status,
      checkInLat,
      checkInLng,
      salesmanId,
    } = req.body;

    const visitorId = salesmanId || req.user.id;
    const visitorRole = req.user.role === 'BM' && !salesmanId ? 'BM' : 'SALESMAN';

    const visitDateObj = new Date(visitDate);
    const month = visitDateObj.getMonth() + 1;
    const year = visitDateObj.getFullYear();

    const photoUrl = req.file?.path || req.body.photoUrl || null;

    if (process.env.REQUIRE_PHOTO_ON_VISIT === 'true' && !photoUrl) {
      return res.status(400).json({ message: 'Photo is required' });
    }

    if (process.env.REQUIRE_GPS_ON_VISIT === 'true' && (!checkInLat || !checkInLng)) {
      return res.status(400).json({ message: 'GPS location is required' });
    }

    const visit = await prisma.visit.create({
      data: {
        visitorId,
        visitorRole,
        dealerId,
        visitDate: visitDateObj,
        visitTime: visitTime ? new Date(`2000-01-01T${visitTime}`) : null,
        purpose,
        remarks,
        outcome,
        nextAction,
        status: status || 'COMPLETED',
        checkInLat: checkInLat ? parseFloat(checkInLat) : null,
        checkInLng: checkInLng ? parseFloat(checkInLng) : null,
        photoUrl,
        month,
        year,
      },
      include: {
        dealer: {
          select: { id: true, name: true, shopName: true, city: true },
        },
        visitor: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json(visit);
  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getVisits = async (req, res) => {
  try {
    const {
      month,
      year,
      dealerId,
      purpose,
      status,
      fromDate,
      toDate,
      salesmanId,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};

    if (req.user.role === 'SALESMAN') {
      where.visitorId = req.user.id;
    } else if (req.user.role === 'BM') {
      if (salesmanId) {
        where.visitorId = salesmanId;
      } else {
        const teamSalesmen = await prisma.user.findMany({
          where: { bmId: req.user.id },
          select: { id: true },
        });
        const teamIds = teamSalesmen.map((s) => s.id);
        where.OR = [
          { visitorId: { in: teamIds } },
          { visitorId: req.user.id },
        ];
      }
    }

    if (dealerId) where.dealerId = dealerId;
    if (purpose) where.purpose = purpose;
    if (status) where.status = status;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    if (fromDate || toDate) {
      where.visitDate = {};
      if (fromDate) where.visitDate.gte = new Date(fromDate);
      if (toDate) where.visitDate.lte = new Date(toDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        include: {
          dealer: {
            select: { id: true, name: true, shopName: true, city: true, category: true },
          },
          visitor: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { visitDate: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.visit.count({ where }),
    ]);

    res.json({
      visits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getVisitById = async (req, res) => {
  try {
    const { id } = req.params;

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        dealer: {
          select: { id: true, name: true, shopName: true, city: true, address: true, phone: true },
        },
        visitor: {
          select: { id: true, name: true, role: true, phone: true },
        },
      },
    });

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (req.user.role === 'SALESMAN' && visit.visitorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(visit);
  } catch (error) {
    console.error('Get visit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingVisit = await prisma.visit.findUnique({ where: { id } });
    if (!existingVisit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    // Only allow edit within 24 hours or if BM
    const hoursSinceCreation = (new Date() - existingVisit.createdAt) / (1000 * 60 * 60);
    if (req.user.role === 'SALESMAN' && hoursSinceCreation > 24) {
      return res.status(403).json({ message: 'Visit can only be edited within 24 hours' });
    }

    if (req.user.role === 'SALESMAN' && existingVisit.visitorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (updateData.visitDate) {
      const visitDateObj = new Date(updateData.visitDate);
      updateData.month = visitDateObj.getMonth() + 1;
      updateData.year = visitDateObj.getFullYear();
      updateData.visitDate = visitDateObj;
    }

    if (req.file) {
      updateData.photoUrl = req.file.path;
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: updateData,
      include: {
        dealer: {
          select: { id: true, name: true, shopName: true, city: true },
        },
        visitor: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.json(visit);
  } catch (error) {
    console.error('Update visit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const existingVisit = await prisma.visit.findUnique({ where: { id } });
    if (!existingVisit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    const hoursSinceCreation = (new Date() - existingVisit.createdAt) / (1000 * 60 * 60);
    if (req.user.role === 'SALESMAN' && hoursSinceCreation > 24) {
      return res.status(403).json({ message: 'Visit can only be deleted within 24 hours' });
    }

    if (req.user.role === 'SALESMAN' && existingVisit.visitorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.visit.delete({ where: { id } });
    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('Delete visit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let stats = {};

    if (req.user.role === 'SALESMAN') {
      // Get target for current month
      const target = await prisma.visitTarget.findUnique({
        where: {
          salesmanId_targetMonth_targetYear: {
            salesmanId: req.user.id,
            targetMonth: currentMonth,
            targetYear: currentYear,
          },
        },
      });

      // Get visits this month
      const visitsThisMonth = await prisma.visit.count({
        where: {
          visitorId: req.user.id,
          month: currentMonth,
          year: currentYear,
          status: 'COMPLETED',
        },
      });

      // Get visits this week
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const visitsThisWeek = await prisma.visit.count({
        where: {
          visitorId: req.user.id,
          visitDate: { gte: weekStart },
          status: 'COMPLETED',
        },
      });

      // Get streak
      const recentVisits = await prisma.visit.findMany({
        where: {
          visitorId: req.user.id,
          status: 'COMPLETED',
        },
        orderBy: { visitDate: 'desc' },
        select: { visitDate: true },
      });

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const visitDates = [...new Set(recentVisits.map((v) => v.visitDate.toISOString().split('T')[0]))];

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (visitDates.includes(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Top dealers this month
      const topDealers = await prisma.visit.groupBy({
        by: ['dealerId'],
        where: {
          visitorId: req.user.id,
          month: currentMonth,
          year: currentYear,
          status: 'COMPLETED',
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      });

      const dealerIds = topDealers.map((d) => d.dealerId);
      const dealers = await prisma.dealer.findMany({
        where: { id: { in: dealerIds } },
        select: { id: true, name: true, shopName: true },
      });

      const topDealersWithCount = topDealers.map((td) => ({
        ...td,
        dealer: dealers.find((d) => d.id === td.dealerId),
      }));

      // Recent visits
      const recentVisits = await prisma.visit.findMany({
        where: { visitorId: req.user.id },
        include: {
          dealer: { select: { id: true, name: true, shopName: true } },
        },
        orderBy: { visitDate: 'desc' },
        take: 10,
      });

      // Planned visits
      const plannedVisits = await prisma.visit.findMany({
        where: {
          visitorId: req.user.id,
          status: 'PLANNED',
          visitDate: { gte: new Date() },
        },
        include: {
          dealer: { select: { id: true, name: true, shopName: true } },
        },
        orderBy: { visitDate: 'asc' },
      });

      stats = {
        target: target?.targetCount || 0,
        visitsThisMonth,
        visitsThisWeek,
        achievement: target?.targetCount ? Math.round((visitsThisMonth / target.targetCount) * 100) : 0,
        streak,
        topDealers: topDealersWithCount,
        recentVisits,
        plannedVisits,
      };
    } else if (req.user.role === 'BM') {
      const teamSalesmen = await prisma.user.findMany({
        where: { bmId: req.user.id },
        select: { id: true },
      });
      const teamIds = teamSalesmen.map((s) => s.id);

      // Total team visits this month
      const totalVisits = await prisma.visit.count({
        where: {
          visitorId: { in: teamIds },
          month: currentMonth,
          year: currentYear,
          status: 'COMPLETED',
        },
      });

      // BM own visits
      const bmVisits = await prisma.visit.count({
        where: {
          visitorId: req.user.id,
          month: currentMonth,
          year: currentYear,
          status: 'COMPLETED',
        },
      });

      // Total target
      const targets = await prisma.visitTarget.aggregate({
        where: {
          salesmanId: { in: teamIds },
          targetMonth: currentMonth,
          targetYear: currentYear,
        },
        _sum: { targetCount: true },
      });

      // Salesman performance
      const salesmanStats = await Promise.all(
        teamSalesmen.map(async (salesman) => {
          const salesmanTarget = await prisma.visitTarget.findUnique({
            where: {
              salesmanId_targetMonth_targetYear: {
                salesmanId: salesman.id,
                targetMonth: currentMonth,
                targetYear: currentYear,
              },
            },
          });

          const salesmanVisits = await prisma.visit.count({
            where: {
              visitorId: salesman.id,
              month: currentMonth,
              year: currentYear,
              status: 'COMPLETED',
            },
          });

          const lastVisit = await prisma.visit.findFirst({
            where: { visitorId: salesman.id, status: 'COMPLETED' },
            orderBy: { visitDate: 'desc' },
            select: { visitDate: true },
          });

          const salesmanInfo = await prisma.user.findUnique({
            where: { id: salesman.id },
            select: { id: true, name: true, email: true, isActive: true },
          });

          return {
            ...salesmanInfo,
            target: salesmanTarget?.targetCount || 0,
            visits: salesmanVisits,
            achievement: salesmanTarget?.targetCount
              ? Math.round((salesmanVisits / salesmanTarget.targetCount) * 100)
              : 0,
            lastVisitDate: lastVisit?.visitDate || null,
          };
        })
      );

      // Dealer coverage
      const dealerVisits = await prisma.visit.groupBy({
        by: ['dealerId'],
        where: {
          OR: [{ visitorId: { in: teamIds } }, { visitorId: req.user.id }],
          month: currentMonth,
          year: currentYear,
        },
        _count: { id: true },
      });

      const allDealers = await prisma.dealer.findMany({
        where: { isActive: true },
        include: {
          assignments: {
            include: {
              salesman: { select: { id: true, name: true } },
            },
          },
        },
      });

      const dealerCoverage = allDealers.map((dealer) => ({
        ...dealer,
        visitsThisMonth: dealerVisits.find((dv) => dv.dealerId === dealer.id)?._count?.id || 0,
      }));

      // Notifications
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      stats = {
        totalSalesmen: teamSalesmen.length,
        totalVisits,
        bmVisits,
        totalTarget: targets._sum?.targetCount || 0,
        achievement: targets._sum?.targetCount
          ? Math.round((totalVisits / targets._sum.targetCount) * 100)
          : 0,
        salesmanStats,
        dealerCoverage,
        notifications,
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createVisit,
  getVisits,
  getVisitById,
  updateVisit,
  deleteVisit,
  getDashboardStats,
};