import { PrismaClient, Role, RevenueSource, Department, PaymentMethod, WorkShift } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Phạm vi dữ liệu demo: Thứ Hai 2026-10-05 → Thứ Bảy 2026-10-24 ───────────
const RANGE_START = '2026-10-05';
const RANGE_END = '2026-10-24';

type SeedDay = { date: string; pos: number; eatclub: number; labour: number };

// Tuần mốc 2026-10-12 → 2026-10-18 (Th2 → CN), khớp docs/design/home.html.
const sampleWeekDays: SeedDay[] = [
  { date: '2026-10-12', pos: 17200000, eatclub: 5200000, labour: 6800000 },
  { date: '2026-10-13', pos: 18200000, eatclub: 3800000, labour: 6500000 },
  { date: '2026-10-14', pos: 18200000, eatclub: 3800000, labour: 9200000 },
  { date: '2026-10-15', pos: 20300000, eatclub: 4200000, labour: 7400000 },
  { date: '2026-10-16', pos: 19800000, eatclub: 3600000, labour: 6600000 },
  { date: '2026-10-17', pos: 23600000, eatclub: 7800000, labour: 9400000 },
  { date: '2026-10-18', pos: 24000000, eatclub: 4400000, labour: 12200000 },
];

// Hệ số so với tuần mốc, theo từng thứ Th2 → CN. Nhân cho cả doanh thu lẫn chi
// phí nhân công nên lợi nhuận biến thiên cùng chiều — icon tăng/giảm rơi đúng
// ngày mong muốn. Tuần trước để Th2 giảm, Th3 tăng, ... xen kẽ; tuần sau đảo
// lại, nhờ vậy cùng một thứ luôn luân phiên tăng/giảm qua các tuần.
const PREV_WEEK_FACTORS = [0.9, 1.12, 0.9, 1.12, 0.9, 1.12, 0.9];
const NEXT_WEEK_FACTORS = [0.86, 1.06, 0.86, 1.06, 0.86, 1.06, 0.86];

const shiftDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const scaleDay = (day: SeedDay, factor: number, offsetDays: number): SeedDay => ({
  date: shiftDays(day.date, offsetDays),
  pos: Math.round(day.pos * factor),
  eatclub: Math.round(day.eatclub * factor),
  labour: Math.round(day.labour * factor),
});

// 3 tuần liền nhau: tuần trước (10-05), tuần mốc (10-12), tuần sau (10-19).
// Cắt theo RANGE_END nên tuần thứ ba dừng ở Thứ Bảy 2026-10-24.
const seedDays: SeedDay[] = [
  ...sampleWeekDays.map((d, i) => scaleDay(d, PREV_WEEK_FACTORS[i], -7)),
  ...sampleWeekDays,
  ...sampleWeekDays.map((d, i) => scaleDay(d, NEXT_WEEK_FACTORS[i], 7)),
].filter((d) => d.date >= RANGE_START && d.date <= RANGE_END);

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

  // 4. Dữ liệu demo 3 tuần liền nhau (2026-10-05 → 2026-10-24)
  // Xoá dữ liệu cũ trong phạm vi trước, để seed chạy lại luôn cho ra đúng một
  // bộ số (nếu chỉ create thì chạy lại sẽ nhân đôi doanh thu).
  const rangeStart = new Date(`${RANGE_START}T00:00:00.000Z`);
  const rangeEnd = new Date(`${RANGE_END}T23:59:59.999Z`);
  const clearedEvents = await prisma.eventAnnotation.deleteMany({
    where: { eventDate: { gte: rangeStart, lte: rangeEnd } },
  });
  const clearedLabours = await prisma.labourCost.deleteMany({
    where: { expenseDate: { gte: rangeStart, lte: rangeEnd } },
  });
  console.log(
    `🧹 Đã xoá ${clearedEvents.count} bản ghi doanh thu và ${clearedLabours.count} chi phí nhân công cũ trong phạm vi.`,
  );

  for (const item of seedDays) {
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

  const profitLine = seedDays
    .map((d) => {
      const profit = d.pos + d.eatclub - d.labour;
      return `   ${d.date}  LN=${profit.toLocaleString('en-US')}`;
    })
    .join('\n');
  console.log(`✅ Đã tạo ${seedDays.length} ngày dữ liệu demo:\n${profitLine}`);

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
