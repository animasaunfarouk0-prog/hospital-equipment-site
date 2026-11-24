import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
 
const prisma = new PrismaClient();
 
const equipmentList = [
  { name: 'Oxygen Concentrator', category: 'Respiratory' },
  { name: 'Oxygen Cylinder', category: 'Respiratory' },
  { name: 'Ventilator', category: 'Respiratory' },
  { name: 'Dialysis Machine', category: 'Renal' },
  { name: 'ICU Bed', category: 'Critical care' },
  { name: 'Neonatal Incubator', category: 'Neonatal' },
  { name: 'Defibrillator', category: 'Cardiac' },
  { name: 'X-Ray Machine', category: 'Imaging' },
  { name: 'CT Scanner', category: 'Imaging' },
  { name: 'Ultrasound Machine', category: 'Imaging' },
];
 
// DEMO DATA ONLY: made-up names, approximate coordinates.
const hospitals = [
  { name: 'Ikeja Demo General Hospital', address: 'Ikeja, Lagos',
    state: 'Lagos', lga: 'Ikeja', lat: 6.6018, lng: 3.3515 },
  { name: 'Surulere Demo Medical Centre', address: 'Surulere, Lagos',
    state: 'Lagos', lga: 'Surulere', lat: 6.5010, lng: 3.3580 },
  { name: 'Yaba Demo Teaching Hospital', address: 'Yaba, Lagos',
    state: 'Lagos', lga: 'Lagos Mainland', lat: 6.5095, lng: 3.3711 },
  { name: 'Victoria Island Demo Hospital', address: 'Victoria Island, Lagos',
    state: 'Lagos', lga: 'Eti-Osa', lat: 6.4281, lng: 3.4219 },
  { name: 'Lekki Demo Specialist Hospital', address: 'Lekki, Lagos',
    state: 'Lagos', lga: 'Eti-Osa', lat: 6.4698, lng: 3.5852 },
  { name: 'Garki Demo General Hospital', address: 'Garki, Abuja',
    state: 'FCT', lga: 'Abuja Municipal', lat: 9.0300, lng: 7.4900 },
  { name: 'Wuse Demo Medical Centre', address: 'Wuse, Abuja',
    state: 'FCT', lga: 'Abuja Municipal', lat: 9.0700, lng: 7.4700 },
  { name: 'Ibadan Demo Teaching Hospital', address: 'Ibadan, Oyo',
    state: 'Oyo', lga: 'Ibadan North', lat: 7.3775, lng: 3.9470 },
  { name: 'Port Harcourt Demo Hospital', address: 'Port Harcourt, Rivers',
    state: 'Rivers', lga: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
  { name: 'Kano Demo General Hospital', address: 'Kano, Kano',
    state: 'Kano', lga: 'Kano Municipal', lat: 12.0022, lng: 8.5920 },
];
 
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
 
async function main() {
  // Start clean. This wipes availability, users and hospitals.
  await prisma.availability.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();
 
  // 1. Equipment types
  for (const item of equipmentList) {
    await prisma.equipment.upsert({
      where: { name: item.name },
      update: { category: item.category },
      create: item,
    });
  }
  const equipment = await prisma.equipment.findMany();
 
  // 2. Hospitals (verified so they show up in search)
  const created = [];
  for (const h of hospitals) {
    created.push(await prisma.hospital.create({ data: { ...h, verified: true } }));
  }
 
  // 3. Availability: every hospital gets a status for every item
  const rows = [];
  for (const h of created) {
    for (const e of equipment) {
      const status = pick(['AVAILABLE', 'AVAILABLE', 'LIMITED', 'UNAVAILABLE']);
      let quantity = 0;
      if (status === 'LIMITED') quantity = between(1, 2);
      if (status === 'AVAILABLE') quantity = between(3, 10);
 
      rows.push({
        hospitalId: h.id,
        equipmentId: e.id,
        status,
        quantity,
        // some rows are older than 24 hours so you can see the "stale" label
        updatedAt: new Date(Date.now() - between(1, 48) * 60 * 60 * 1000),
      });
    }
  }
  await prisma.availability.createMany({ data: rows });
 
  // 4. Test accounts (change these passwords before any real use!)
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('Admin12345', 10),
      role: 'ADMIN',
    },
  });
  await prisma.user.create({
    data: {
      email: 'staff@example.com',
      passwordHash: await bcrypt.hash('Staff12345', 10),
      role: 'HOSPITAL_STAFF',
      hospitalId: created[0].id,
    },
  });
 
  console.log('Seeding finished.');
}
 
main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());