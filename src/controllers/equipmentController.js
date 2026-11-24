import prisma from '../config/db.js';

// All equipment types, optionally filtered: /api/equipment?category=Imaging
export const listEquipment = async (req, res) => {
  const { category } = req.query;

  const items = await prisma.equipment.findMany({
    where: category
      ? { category: { equals: category.trim(), mode: 'insensitive' } }
      : {},
    orderBy: { name: 'asc' },
  });

  res.json(items);
};