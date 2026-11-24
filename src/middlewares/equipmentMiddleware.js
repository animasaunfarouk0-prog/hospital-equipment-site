// Optional filter: GET /api/equipment?category=Imaging
export const validateEquipmentQuery = (req, res, next) => {
  const { category } = req.query;

  if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
    return res.status(400).json({ error: 'Category must be text' });
  }
  next();
};