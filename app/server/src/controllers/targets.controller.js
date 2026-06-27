const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getMyTargets = async (req, res) => {
  try {
    const { month, year } = req.query;

    const where = { salesmanId: req.user.id };
    if (month) where.targetMonth = parseInt(month);
    if (year) where.targetYear = parseInt(year);

    const targets = await prisma.visitTarget.findMany({
      where,
      include: {
        setBy: { select: { id: true, name: true } },
      },
      orderBy: [{ targetYear: 'desc' }, { targetMonth: 'desc' }],
    });

    // Add achievement data
    const targetsWithAchievement = await Promise.all(
      targets.map(async (target) => {
        const visits = await prisma.visit.count({
          where: {
            visitorId: req.user.id,
            month: target.targetMonth,
            year: target.targetYear,
            status: 'COMPLETED',
          },
        });

        return {
          ...target,
          visitsDone: visits,
          achievement: target.targetCount ? Math.round((visits / target.targetCount) * 100) : 0,
        };
      })
    );

    res.json(targetsWithAchievement);
  } catch (error) {
    console.error('Get targets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeamTargets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const teamSalesmen = await prisma.user.findMany({
      where: { bmId: req.user.id },
      select: { id: true, name: true, email: true },
    });

    const targets = await Promise.all(
      teamSalesmen.map(async (salesman) => {
        const target = await prisma.visitTarget.findUnique({
          where: {
            salesmanId_targetMonth_targetYear: {
              salesmanId: salesman.id,
              targetMonth: currentMonth,
              targetYear: currentYear,
            },
          },
        });

        const visits = await prisma.visit.count({
          where: {
            visitorId: salesman.id,
            month: currentMonth,
            year: currentYear,
            status: 'COMPLETED',
          },
        });

        return {
          salesman,
          target: target?.targetCount || 0,
          visits,
          achievement: target?.targetCount ? Math.round((visits / target.targetCount) * 100) : 0,
          targetId: target?.id || null,
        };
      })
    );

    res.json(targets);
  } catch (error) {
    console.error('Get team targets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const setTarget = async (req, res) => {
  try {
    const { salesmanId, targetMonth, targetYear, targetCount } = req.body;

    // Verify salesman belongs to this BM
    const salesman = await prisma.user.findFirst({
      where: { id: salesmanId, bmId: req.user.id },
    });

    if (!salesman) {
      return res.status(403).json({ message: 'Salesman not found in your team' });
    }

    const target = await prisma.visitTarget.upsert({
      where: {
        salesmanId_targetMonth_targetYear: {
          salesmanId,
          targetMonth: parseInt(targetMonth),
          targetYear: parseInt(targetYear),
        },
      },
      update: { targetCount: parseInt(targetCount) },
      create: {
        salesmanId,
        setByBmId: req.user.id,
        targetMonth: parseInt(targetMonth),
        targetYear: parseInt(targetYear),
        targetCount: parseInt(targetCount),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: salesmanId,
        title: 'New Target Set',
        message: `Your target for ${targetMonth}/${targetYear} has been set to ${targetCount} visits`,
        type: 'TARGET_SET',
      },
    });

    res.json(target);
  } catch (error) {
    console.error('Set target error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const setBulkTargets = async (req, res) => {
  try {
    const { targetMonth, targetYear, targetCount, salesmanIds } = req.body;

    const teamSalesmen = await prisma.user.findMany({
      where: {
        bmId: req.user.id,
        id: salesmanIds ? { in: salesmanIds } : undefined,
      },
      select: { id: true },
    });

    const results = await Promise.all(
      teamSalesmen.map((salesman) =>
        prisma.visitTarget.upsert({
          where: {
            salesmanId_targetMonth_targetYear: {
              salesmanId: salesman.id,
              targetMonth: parseInt(targetMonth),
              targetYear: parseInt(targetYear),
            },
          },
          update: { targetCount: parseInt(targetCount) },
          create: {
            salesmanId: salesman.id,
            setByBmId: req.user.id,
            targetMonth: parseInt(targetMonth),
            targetYear: parseInt(targetYear),
            targetCount: parseInt(targetCount),
          },
        })
      )
    );

    res.json({ message: `Targets set for ${results.length} salesmen`, results });
  } catch (error) {
    console.error('Bulk set targets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyTargets,
  getTeamTargets,
  setTarget,
  setBulkTargets,
};