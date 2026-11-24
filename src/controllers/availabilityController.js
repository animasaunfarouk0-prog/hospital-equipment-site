import prisma from '../config/db.js';

// See my own hospital's current stock
export const getMyAvailability = async (req, res) => {
  const rows = await prisma.availability.findMany({
    where: { hospitalId: req.user.hospitalId },
    include: { equipment: true },
    orderBy: { equipment: { name: 'asc' } },
  });
  res.json(rows);
};

// Update (or add) one item. Input was already checked by validateAvailabilityUpdate
export const updateAvailability = async (req, res) => {
  const equipmentId = Number(req.params.equipmentId);
  const { status, quantity } = req.body;

  const exists = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!exists) return res.status(404).json({ error: 'Equipment not found' });

  // The hospital comes from the login token, NEVER from the request body.
  const hospitalId = req.user.hospitalId;

  const row = await prisma.availability.upsert({
    where: { uq_hospital_equipment: { hospitalId, equipmentId } },
    update: { status, quantity: quantity ?? null, updatedById: req.user.id },
    create: {
      hospitalId,
      equipmentId,
      status,
      quantity: quantity ?? null,
      updatedById: req.user.id,
    },
  });

  res.json(row);
};