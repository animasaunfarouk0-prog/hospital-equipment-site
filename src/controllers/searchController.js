import { searchEquipment } from '../services/searchService.js';

const toNumber = (value) => (value === undefined ? undefined : parseFloat(value));

// Input was already checked by validateSearch
export const search = async (req, res) => {
  const { equipment, state, lat, lng, radiusKm, limit } = req.query;

  const results = await searchEquipment({
    equipment,
    state,
    lat: toNumber(lat),
    lng: toNumber(lng),
    radiusKm: toNumber(radiusKm),
    limit,
  });

  res.json({ count: results.length, results });
};