// src/services/search.service.js
import { Prisma } from '@prisma/client';
import prisma from '../config/db.js'; // exports a single PrismaClient instance

const STALE_AFTER_HOURS = 24;
const EARTH_RADIUS_KM = 6371;

// Escape % and _ so user input can't act as ILIKE wildcards
const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Find verified hospitals that currently have a piece of equipment.
 *
 * @param {object}  params
 * @param {string}  params.equipment  Search text, e.g. "oxygen"
 * @param {string} [params.state]     Filter by state, e.g. "Lagos"
 * @param {number} [params.lat]       User latitude (enables distance sorting)
 * @param {number} [params.lng]       User longitude
 * @param {number} [params.radiusKm]  Max distance when lat/lng given (default 50)
 * @param {number} [params.limit]     Max results (default 20, capped at 50)
 */
export async function searchEquipment({
  equipment,
  state,
  lat,
  lng,
  radiusKm = 50,
  limit = 20,
}) {
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const pattern = `%${escapeLike(equipment.trim())}%`;

  // Haversine distance in km. LEAST/GREATEST guard against tiny floating
  // point errors that would make acos() receive a value just outside [-1, 1].
  const distanceExpr = hasCoords
    ? Prisma.sql`(${EARTH_RADIUS_KM} * acos(LEAST(1, GREATEST(-1,
        cos(radians(${lat}::float8)) * cos(radians(h.lat))
          * cos(radians(h.lng) - radians(${lng}::float8))
        + sin(radians(${lat}::float8)) * sin(radians(h.lat))
      ))))`
    : Prisma.sql`NULL::float8`;

  const stateFilter = state
    ? Prisma.sql`AND h.state ILIKE ${state.trim()}`
    : Prisma.empty;

  const radiusFilter = hasCoords
    ? Prisma.sql`WHERE r.distance_km <= ${radiusKm}::float8`
    : Prisma.empty;

  const orderBy = hasCoords
    ? Prisma.sql`r.distance_km ASC, r.updated_at DESC`
    : Prisma.sql`r.updated_at DESC`;

  const rows = await prisma.$queryRaw`
    SELECT r.*
    FROM (
      SELECT
        h.id            AS hospital_id,
        h.name          AS hospital_name,
        h.address,
        h.state,
        h.lga,
        h.phone,
        h.lat,
        h.lng,
        e.id            AS equipment_id,
        e.name          AS equipment_name,
        a.status::text  AS status,
        a.quantity,
        a.updated_at,
        ${distanceExpr} AS distance_km
      FROM availability a
      JOIN hospitals h ON h.id = a.hospital_id
      JOIN equipment e ON e.id = a.equipment_id
      WHERE h.verified = TRUE
        AND a.status <> 'UNAVAILABLE'
        AND e.name ILIKE ${pattern}
        ${stateFilter}
    ) r
    ${radiusFilter}
    ORDER BY ${orderBy}
    LIMIT ${safeLimit}
  `;

  const now = Date.now();

  return rows.map((row) => {
    const ageHours = (now - new Date(row.updated_at).getTime()) / 36e5;
    return {
      hospital: {
        id: row.hospital_id,
        name: row.hospital_name,
        address: row.address,
        state: row.state,
        lga: row.lga,
        phone: row.phone,
        lat: row.lat,
        lng: row.lng,
      },
      equipment: { id: row.equipment_id, name: row.equipment_name },
      status: row.status,
      quantity: row.quantity,
      updatedAt: row.updated_at,
      isStale: ageHours > STALE_AFTER_HOURS,
      distanceKm:
        row.distance_km == null ? null : Math.round(row.distance_km * 10) / 10,
    };
  });
}

/* ---------- Example controller usage ----------

import { searchEquipment } from '../services/search.service.js';

export const search = async (req, res) => {
  const { equipment, state, lat, lng, radiusKm, limit } = req.query;
  const results = await searchEquipment({
    equipment,
    state,
    lat: lat !== undefined ? parseFloat(lat) : undefined,
    lng: lng !== undefined ? parseFloat(lng) : undefined,
    radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
    limit,
  });
  res.json({ count: results.length, results });
};

------------------------------------------------- */