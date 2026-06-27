const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@1234', 10);
  const bmPassword = await bcrypt.hash('BM@1234', 10);
  const salesmanPassword = await bcrypt.hash('Sales@1234', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@company.com',
      password: hashedPassword,
      phone: '9876543210',
      role: 'ADMIN',
      region: 'All Regions',
    },
  });
  console.log('Created admin:', admin.email);

  // Create BMs
  const bmData = [
    { name: 'Rajesh Sharma', email: 'bm1@company.com', phone: '9876543211', region: 'North Delhi' },
    { name: 'Vikram Patel', email: 'bm2@company.com', phone: '9876543212', region: 'South Delhi' },
  ];

  const bms = [];
  for (const bm of bmData) {
    const created = await prisma.user.create({
      data: {
        ...bm,
        password: bmPassword,
        role: 'BM',
      },
    });
    bms.push(created);
    console.log('Created BM:', created.email);
  }

  // Create Salesmen
  const salesmanNames = [
    { name: 'Amit Kumar', email: 'salesman1@company.com', phone: '9876543213', region: 'North Delhi' },
    { name: 'Sunil Gupta', email: 'salesman2@company.com', phone: '9876543214', region: 'North Delhi' },
    { name: 'Ravi Singh', email: 'salesman3@company.com', phone: '9876543215', region: 'North Delhi' },
    { name: 'Mohit Verma', email: 'salesman4@company.com', phone: '9876543216', region: 'North Delhi' },
    { name: 'Deepak Joshi', email: 'salesman5@company.com', phone: '9876543217', region: 'North Delhi' },
    { name: 'Suresh Reddy', email: 'salesman6@company.com', phone: '9876543218', region: 'South Delhi' },
    { name: 'Anil Mehta', email: 'salesman7@company.com', phone: '9876543219', region: 'South Delhi' },
    { name: 'Pavan Nair', email: 'salesman8@company.com', phone: '9876543220', region: 'South Delhi' },
    { name: 'Kiran Shah', email: 'salesman9@company.com', phone: '9876543221', region: 'South Delhi' },
    { name: 'Nitin Bansal', email: 'salesman10@company.com', phone: '9876543222', region: 'South Delhi' },
  ];

  const salesmen = [];
  for (let i = 0; i < salesmanNames.length; i++) {
    const s = salesmanNames[i];
    const bmId = i < 5 ? bms[0].id : bms[1].id;
    const created = await prisma.user.create({
      data: {
        ...s,
        password: salesmanPassword,
        role: 'SALESMAN',
        bmId,
      },
    });
    salesmen.push(created);
    console.log('Created salesman:', created.email);
  }

  // Create Dealers
  const dealersData = [
    { name: 'Sharma Electronics', shopName: 'Sharma Electronics & Co.', phone: '9810012345', address: '12 Karol Bagh Market', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL001', category: 'PLATINUM' },
    { name: 'Gupta Hardware', shopName: 'Gupta Hardware Store', phone: '9810012346', address: '45 Chandni Chowk', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL002', category: 'GOLD' },
    { name: 'Singh Traders', shopName: 'Singh Trading Company', phone: '9810012347', address: '78 Sadar Bazaar', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL003', category: 'SILVER' },
    { name: 'Kumar Electricals', shopName: 'Kumar Electrical Works', phone: '9810012348', address: '23 Lajpat Nagar', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL004', category: 'GOLD' },
    { name: 'Verma Builders', shopName: 'Verma Builders Supply', phone: '9810012349', address: '56 Rajouri Garden', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL005', category: 'GENERAL' },
    { name: 'Agarwal Pipes', shopName: 'Agarwal Pipe Fittings', phone: '9810012350', address: '89 Pitampura', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL006', category: 'SILVER' },
    { name: 'Joshi Hardware', shopName: 'Joshi Hardware & Tools', phone: '9810012351', address: '34 Rohini Sector 7', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL007', category: 'GENERAL' },
    { name: 'Mehta Enterprises', shopName: 'Mehta Enterprises Pvt Ltd', phone: '9810012352', address: '67 Shalimar Bagh', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL008', category: 'GOLD' },
    { name: 'Reddy Suppliers', shopName: 'Reddy Building Suppliers', phone: '9810012353', address: '90 Vasant Kunj', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL009', category: 'PLATINUM' },
    { name: 'Nair Hardware', shopName: 'Nair Hardware Mart', phone: '9810012354', address: '11 Greater Kailash', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL010', category: 'GOLD' },
    { name: 'Bansal Traders', shopName: 'Bansal Trading Corp', phone: '9810012355', address: '22 Defence Colony', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL011', category: 'SILVER' },
    { name: 'Shah Electronics', shopName: 'Shah Electronics Hub', phone: '9810012356', address: '33 Saket', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL012', category: 'GENERAL' },
    { name: 'Patel Hardware', shopName: 'Patel Hardware Store', phone: '9810012357', address: '44 Vasant Vihar', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL013', category: 'GOLD' },
    { name: 'Iyer Suppliers', shopName: 'Iyer Building Solutions', phone: '9810012358', address: '55 Hauz Khas', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL014', category: 'SILVER' },
    { name: 'Malhotra Tools', shopName: 'Malhotra Tools & Equipment', phone: '9810012359', address: '66 Janakpuri', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL015', category: 'GENERAL' },
    { name: 'Kapoor Electricals', shopName: 'Kapoor Electrical Store', phone: '9810012360', address: '77 Dwarka Sector 12', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL016', category: 'GOLD' },
    { name: 'Das Hardware', shopName: 'Das Hardware & Paints', phone: '9810012361', address: '88 Kalkaji', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL017', category: 'SILVER' },
    { name: 'Jain Traders', shopName: 'Jain Trading Company', phone: '9810012362', address: '99 Nehru Place', city: 'Delhi', region: 'South Delhi', dealerCode: 'DL018', category: 'GENERAL' },
    { name: 'Rao Enterprises', shopName: 'Rao Enterprises', phone: '9810012363', address: '15 Laxmi Nagar', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL019', category: 'SILVER' },
    { name: 'Kohli Builders', shopName: 'Kohli Builders Mart', phone: '9810012364', address: '25 Preet Vihar', city: 'Delhi', region: 'North Delhi', dealerCode: 'DL020', category: 'GENERAL' },
  ];

  const dealers = [];
  for (const d of dealersData) {
    const created = await prisma.dealer.create({ data: d });
    dealers.push(created);
    console.log('Created dealer:', created.name);
  }

  // Assign dealers to salesmen
  for (let i = 0; i < salesmen.length; i++) {
    const startIdx = (i * 2) % dealers.length;
    for (let j = 0; j < 4; j++) {
      const dealerIdx = (startIdx + j) % dealers.length;
      await prisma.dealerAssignment.create({
        data: {
          dealerId: dealers[dealerIdx].id,
          salesmanId: salesmen[i].id,
          assignedBy: i < 5 ? bms[0].id : bms[1].id,
        },
      });
    }
  }
  console.log('Assigned dealers to salesmen');

  // Create targets for current month and last 3 months
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  for (const salesman of salesmen) {
    for (let m = 0; m < 4; m++) {
      let month = currentMonth - m;
      let year = currentYear;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      await prisma.visitTarget.create({
        data: {
          salesmanId: salesman.id,
          setByBmId: salesman.bmId,
          targetMonth: month,
          targetYear: year,
          targetCount: 40 + Math.floor(Math.random() * 30),
        },
      });
    }
  }
  console.log('Created targets');

  // Create demo visits
  const purposes = ['FOLLOW_UP', 'NEW_BUSINESS', 'COMPLAINT', 'DEMO', 'PAYMENT_COLLECTION', 'RELATIONSHIP_VISIT', 'OTHER'];
  const statuses = ['COMPLETED', 'PLANNED', 'CANCELLED'];

  for (let i = 0; i < 300; i++) {
    const salesman = salesmen[Math.floor(Math.random() * salesmen.length)];
    const dealer = dealers[Math.floor(Math.random() * dealers.length)];

    // Random date in last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const visitDate = new Date(now);
    visitDate.setDate(visitDate.getDate() - daysAgo);

    const month = visitDate.getMonth() + 1;
    const year = visitDate.getFullYear();

    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    const status = Math.random() > 0.9 ? 'PLANNED' : Math.random() > 0.95 ? 'CANCELLED' : 'COMPLETED';

    const remarks = [
      'Discussed new product line with dealer. They showed interest in the premium range.',
      'Follow-up visit for payment collection. Received partial payment of Rs. 50,000.',
      'Conducted product demo. Dealer was impressed with the new features.',
      'Relationship visit. Discussed market conditions and competitor activities.',
      'Addressed complaint about delayed delivery. Promised resolution within 3 days.',
      'New business discussion. Dealer wants to expand to new product categories.',
      'Regular check-in. Stock levels are good. Ordered replenishment.',
      'Payment collection visit. Full payment of Rs. 1,25,000 received.',
      'Demo arranged for new launched products. Positive feedback received.',
      'Follow-up on previous order. Delivery scheduled for next week.',
    ];

    await prisma.visit.create({
      data: {
        visitorId: salesman.id,
        visitorRole: 'SALESMAN',
        dealerId: dealer.id,
        visitDate,
        visitTime: new Date(2000, 0, 1, 9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60)),
        purpose,
        status,
        remarks: remarks[Math.floor(Math.random() * remarks.length)],
        outcome: status === 'COMPLETED' ? 'Visit completed successfully' : null,
        nextAction: Math.random() > 0.5 ? 'Follow up next week' : null,
        checkInLat: 28.6 + Math.random() * 0.1,
        checkInLng: 77.1 + Math.random() * 0.1,
        month,
        year,
      },
    });
  }

  // Create some BM visits
  for (let i = 0; i < 30; i++) {
    const bm = bms[Math.floor(Math.random() * bms.length)];
    const dealer = dealers[Math.floor(Math.random() * dealers.length)];
    const daysAgo = Math.floor(Math.random() * 60);
    const visitDate = new Date(now);
    visitDate.setDate(visitDate.getDate() - daysAgo);

    await prisma.visit.create({
      data: {
        visitorId: bm.id,
        visitorRole: 'BM',
        dealerId: dealer.id,
        visitDate,
        purpose: 'RELATIONSHIP_VISIT',
        status: 'COMPLETED',
        remarks: 'BM visit to check dealer satisfaction and discuss growth plans.',
        outcome: 'Positive feedback received',
        month: visitDate.getMonth() + 1,
        year: visitDate.getFullYear(),
      },
    });
  }

  console.log('Created 330 visits');

  // Create some notifications
  for (const salesman of salesmen) {
    await prisma.notification.create({
      data: {
        userId: salesman.id,
        title: 'Welcome to FOS Visit Tracker',
        message: 'Your account has been set up. Start logging your visits today!',
        type: 'SYSTEM',
      },
    });
  }
  console.log('Created notifications');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });