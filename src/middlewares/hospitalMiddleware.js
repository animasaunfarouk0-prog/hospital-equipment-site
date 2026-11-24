// Makes sure the id in the address is a real number, e.g. /api/hospitals/3
export const validateHospitalId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid hospital id' });
  }
  next();
};