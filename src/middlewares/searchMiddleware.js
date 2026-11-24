// Checks the search request BEFORE it reaches the controller.
export const validateSearch = (req, res, next) => {
  const { equipment, state, lat, lng, radiusKm, limit } = req.query;

  if (typeof equipment !== 'string' || !equipment.trim()) {
    return res.status(400).json({ error: 'Please say which equipment you need' });
  }

  if (state !== undefined && typeof state !== 'string') {
    return res.status(400).json({ error: 'State must be text' });
  }

  const numbers = { lat, lng, radiusKm, limit };
  for (const [name, value] of Object.entries(numbers)) {
    if (value === undefined) continue;
    if (typeof value !== 'string' || value.trim() === '' || Number.isNaN(Number(value))) {
      return res.status(400).json({ error: `${name} must be a number` });
    }
  }

  if ((lat === undefined) !== (lng === undefined)) {
    return res.status(400).json({ error: 'Send both lat and lng, or neither' });
  }

  next();
};