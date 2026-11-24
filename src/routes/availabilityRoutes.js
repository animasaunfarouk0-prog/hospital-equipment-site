import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/guard.js';
import { validateAvailabilityUpdate } from '../middlewares/availabilityMiddleware.js';
import {
  getMyAvailability,
  updateAvailability,
} from '../controllers/availabilityController.js';

const router = Router();

// Everything below needs a logged-in hospital staff member
router.use(requireAuth, requireRole('HOSPITAL_STAFF'));

router.get('/mine', getMyAvailability);
router.put('/:equipmentId', validateAvailabilityUpdate, updateAvailability);

export default router;