import { PrismaClient, Role, RevenueSource, Department, PaymentMethod, WorkShift } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu (Seeding)...');

  // 1. Tạo tài khoản Admin mặc định
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bistro.local' },
    update: {},
    create: {
      email: 'admin@bistro.local',
      fullName: 'Quản trị viên',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // 2. Tạo tài khoản Quản lý mẫu
  const managerPassword = await bcrypt.hash('Manager@123456', 10);
  await prisma.user.upsert({
    where: { email: 'manager@bistro.local' },
    update: {},
    create: {
      email: 'manager@bistro.local',
      fullName: 'Nguyễn Văn Quản Lý',
      passwordHash: managerPassword,
      role: Role.MANAGER,
      isActive: true,
    },
  });

  // 3. Tạo tài khoản Phân tích mẫu
  const analystPassword = await bcrypt.hash('Analyst@123456', 10);
  await prisma.user.upsert({
    where: { email: 'analyst@bistro.local' },
    update: {},
    create: {
      email: 'analyst@bistro.local',
      fullName: 'Trần Thị Chuyên Viên',
      passwordHash: analystPassword,
      role: Role.ANALYST,
      isActive: true,
    },
  });

  console.log(`✅ Đã tạo tài khoản quản trị: ${admin.email}`);

  // 4. Dữ liệu bán hàng & sự kiện mẫu cho tuần hiện tại (2026-10-12 đến 2026-10-18)
  const sampleWeekDays = [
    { date: '2026-10-12', pos: 17200000, eatclub: 5200000, labour: 6800000 },
    { date: '2026-10-13', pos: 18200000, eatclub: 3800000, labour: 6500000 },
    { date: '2026-10-14', pos: 18200000, eatclub: 3800000, labour: 9200000 },
    { date: '2026-10-15', pos: 20300000, eatclub: 4200000, labour: 7400000 },
    { date: '2026-10-16', pos: 19800000, eatclub: 3600000, labour: 6600000 },
    { date: '2026-10-17', pos: 23600000, eatclub: 7800000, labour: 9400000 },
    { date: '2026-10-18', pos: 24000000, eatclub: 4400000, labour: 12200000 },
  ];

  for (const item of sampleWeekDays) {
    const entryDate = new Date(item.date);

    // POS Sales
    await prisma.eventAnnotation.create({
      data: {
        title: 'Bán hàng POS tại quầy',
        source: RevenueSource.POS,
        amount: item.pos,
        eventDate: entryDate,
        shift: WorkShift.CA_NGAY,
        note: 'Doanh thu POS tại quầy trong ngày',
        createdById: admin.id,
      },
    });

    // Eatclub Sales
    await prisma.eventAnnotation.create({
      data: {
        title: 'Bán hàng app đối tác Eatclub',
        source: RevenueSource.EATCLUB,
        amount: item.eatclub,
        eventDate: entryDate,
        shift: WorkShift.CA_NGAY,
        note: 'Doanh thu đối tác Eatclub trong ngày',
        createdById: admin.id,
      },
    });

    // Labour Cost
    const existingLabour = await prisma.labourCost.findFirst({
      where: { expenseDate: entryDate, createdById: admin.id },
    });
    if (!existingLabour) {
      await prisma.labourCost.create({
        data: {
          expenseDate: entryDate,
          amount: item.labour,
          department: Department.FOH,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          note: 'Chi phí nhân công trong ngày',
          createdById: admin.id,
        },
      });
    }
  }

  // 5. Sự kiện mẫu
  const eventDate = new Date('2026-10-17');
  const existingEvent = await prisma.eventAnnotation.findFirst({
    where: { eventDate },
  });
  if (!existingEvent) {
    await prisma.eventAnnotation.create({
      data: {
        title: 'Live nhạc Acoustic cuối tuần',
        source: RevenueSource.POS,
        amount: 3500000,
        eventDate,
        shift: WorkShift.CA_TOI,
        note: 'Đêm nhạc acoustic thu hút thêm khách đặt bàn',
        createdById: admin.id,
      },
    });
  }

  console.log('✅ Khởi tạo dữ liệu mẫu hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khởi tạo dữ liệu mẫu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
