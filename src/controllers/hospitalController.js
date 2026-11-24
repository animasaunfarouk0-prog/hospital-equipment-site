import prisma from '../config/db.js';

// One verified hospital with its equipment. The id was checked by validateHospitalId
export const getHospital = async (req, res) => {
  const id = Number(req.params.id);

  const hospital = await prisma.hospital.findFirst({
    where: { id, verified: true },
    include: { availability: { include: { equipment: true } } },
  });
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  res.json(hospital);
};

// Admin approves a hospital so it appears in search
export const verifyHospital = async (req, res) => {
  const id = Number(req.params.id);

  const exists = await prisma.hospital.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Hospital not found' });

  const hospital = await prisma.hospital.update({
    where: { id },
    data: { verified: true },
  });
  res.json(hospital);
};