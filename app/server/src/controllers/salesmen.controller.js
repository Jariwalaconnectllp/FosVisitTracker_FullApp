const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const getSalesmen = async (req, res) => {
  try {
    const where = {};

    if (req.user.role === 'BM') {
      where.bmId = req.user.id;
    } else if (req.user.role === 'SALESMAN') {
      return res.json([]);
    }

    const salesmen = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        region: true,
        isActive: true,
        createdAt: true,
        bm: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Add stats for each salesman
    const salesmenWithStats = await Promise.all(
      salesmen.map(async (salesman) => {
        const totalVisits = await prisma.visit.count({
          where: { visitorId: salesman.id, status: 'COMPLETED' },
        });

        const lastVisit = await prisma.visit.findFirst({
          where: { visitorId: salesman.id, status: 'COMPLETED' },
          orderBy: { visitDate: 'desc' },
          select: { visitDate: true },
        });

        const assignedDealers = await prisma.dealerAssignment.count({
          where: { salesmanId: salesman.id },
        });

        return {
          ...salesman,
          totalVisits,
          lastVisitDate: lastVisit?.visitDate || null,
          assignedDealers,
        };
      })
    );

    res.json(salesmenWithStats);
  } catch (error) {
    console.error('Get salesmen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSalesmanById = async (req, res) => {
  try {
    const { id } = req.params;

    const salesman = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        region: true,
        isActive: true,
        createdAt: true,
        bm: { select: { id: true, name: true } },
      },
    });

    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }

    // Get stats
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const totalVisits = await prisma.visit.count({
      where: { visitorId: id, status: 'COMPLETED' },
    });

    const thisMonthVisits = await prisma.visit.count({
      where: {
        visitorId: id,
        month: currentMonth,
        year: currentYear,
        status: 'COMPLETED',
      },
    });

    const target = await prisma.visitTarget.findUnique({
      where: {
        salesmanId_targetMonth_targetYear: {
          salesmanId: id,
          targetMonth: currentMonth,
          targetYear: currentYear,
        },
      },
    });

    const assignedDealers = await prisma.dealer.findMany({
      where: {
        assignments: {
          some: { salesmanId: id },
        },
      },
    });

    res.json({
      ...salesman,
      stats: {
        totalVisits,
        thisMonthVisits,
        target: target?.targetCount || 0,
        achievement: target?.targetCount
          ? Math.round((thisMonthVisits / target.targetCount) * 100)
          : 0,
        assignedDealers: assignedDealers.length,
      },
      dealers: assignedDealers,
    });
  } catch (error) {
    console.error('Get salesman error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createSalesman = async (req, res) => {
  try {
    const { name, email, phone, region } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const salesman = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'SALESMAN',
        region,
        bmId: req.user.role === 'BM' ? req.user.id : req.body.bmId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        region: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      ...salesman,
      tempPassword: password,
    });
  } catch (error) {
    console.error('Create salesman error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSalesman = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, region, isActive } = req.body;

    const salesman = await prisma.user.update({
      where: { id },
      data: { name, phone, region, isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        region: true,
        isActive: true,
      },
    });

    res.json(salesman);
  } catch (error) {
    console.error('Update salesman error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const salesman = await prisma.user.findUnique({ where: { id } });
    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !salesman.isActive },
    });

    res.json({ id: updated.id, isActive: updated.isActive });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSalesmen,
  getSalesmanById,
  createSalesman,
  updateSalesman,
  toggleActive,
};