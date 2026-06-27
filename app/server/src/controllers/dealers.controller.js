const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDealers = async (req, res) => {
  try {
    const { search, city, region, category, page = 1, limit = 20, assigned } = req.query;

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shopName: { contains: search, mode: 'insensitive' } },
        { dealerCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) where.city = city;
    if (region) where.region = region;
    if (category) where.category = category;

    if (assigned === 'true' && req.user.role === 'SALESMAN') {
      const assignments = await prisma.dealerAssignment.findMany({
        where: { salesmanId: req.user.id },
        select: { dealerId: true },
      });
      where.id = { in: assignments.map((a) => a.dealerId) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [dealers, total] = await Promise.all([
      prisma.dealer.findMany({
        where,
        include: {
          assignments: {
            include: {
              salesman: { select: { id: true, name: true } },
            },
          },
          _count: {
            select: { visits: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.dealer.count({ where }),
    ]);

    // Get last visit date for each dealer
    const dealersWithLastVisit = await Promise.all(
      dealers.map(async (dealer) => {
        const lastVisit = await prisma.visit.findFirst({
          where: { dealerId: dealer.id },
          orderBy: { visitDate: 'desc' },
          select: { visitDate: true },
        });

        const daysSinceLastVisit = lastVisit
          ? Math.floor((new Date() - new Date(lastVisit.visitDate)) / (1000 * 60 * 60 * 24))
          : null;

        return {
          ...dealer,
          lastVisitDate: lastVisit?.visitDate || null,
          daysSinceLastVisit,
          alert: daysSinceLastVisit !== null && daysSinceLastVisit > 30,
        };
      })
    );

    res.json({
      dealers: dealersWithLastVisit,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get dealers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDealerById = async (req, res) => {
  try {
    const { id } = req.params;

    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            salesman: { select: { id: true, name: true, email: true } },
          },
        },
        visits: {
          include: {
            visitor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }

    res.json(dealer);
  } catch (error) {
    console.error('Get dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDealer = async (req, res) => {
  try {
    const { name, shopName, phone, address, city, region, dealerCode, category } = req.body;

    const existing = await prisma.dealer.findUnique({
      where: { dealerCode: dealerCode || undefined },
    });

    if (existing) {
      return res.status(400).json({ message: 'Dealer code already exists' });
    }

    const dealer = await prisma.dealer.create({
      data: {
        name,
        shopName,
        phone,
        address,
        city,
        region,
        dealerCode,
        category: category || 'GENERAL',
      },
    });

    res.status(201).json(dealer);
  } catch (error) {
    console.error('Create dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const dealer = await prisma.dealer.update({
      where: { id },
      data: updateData,
    });

    res.json(dealer);
  } catch (error) {
    console.error('Update dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleDealerActive = async (req, res) => {
  try {
    const { id } = req.params;

    const dealer = await prisma.dealer.findUnique({ where: { id } });
    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }

    const updated = await prisma.dealer.update({
      where: { id },
      data: { isActive: !dealer.isActive },
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignDealer = async (req, res) => {
  try {
    const { dealerId, salesmanId } = req.body;

    const existing = await prisma.dealerAssignment.findUnique({
      where: {
        dealerId_salesmanId: {
          dealerId,
          salesmanId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Dealer already assigned to this salesman' });
    }

    const assignment = await prisma.dealerAssignment.create({
      data: {
        dealerId,
        salesmanId,
        assignedBy: req.user.id,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Assign dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unassignDealer = async (req, res) => {
  try {
    const { dealerId, salesmanId } = req.body;

    await prisma.dealerAssignment.delete({
      where: {
        dealerId_salesmanId: {
          dealerId,
          salesmanId,
        },
      },
    });

    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('Unassign dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDealers,
  getDealerById,
  createDealer,
  updateDealer,
  toggleDealerActive,
  assignDealer,
  unassignDealer,
};