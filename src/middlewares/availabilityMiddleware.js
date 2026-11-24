const STATUSES = ['AVAILABLE', 'LIMITED', 'UNAVAILABLE'];

// Checks the stock-update request before it reaches the controller.
export const validateAvailabilityUpdate = (req, res, next) => {
  const equipmentId = Number(req.params.equipmentId);
  const { status, quantity } = req.body ?? {};

  if (!Number.isInteger(equipmentId) || equipmentId < 1) {
    return res.status(400).json({ error: 'Invalid equipment id' });
  }
  if (!STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Status must be AVAILABLE, LIMITED or UNAVAILABLE',
    });
  }
  if (quantity != null && (!Number.isInteger(quantity) || quantity < 0)) {
    return res.status(400).json({ error: 'Quantity must be 0 or more' });
  }
  next();
};