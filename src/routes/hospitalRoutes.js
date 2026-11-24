import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/guard.js';
import { validateHospitalId } from '../middlewares/hospitalMiddleware.js';
import { getHospital, verifyHospital } from '../controllers/hospitalController.js';

const router = Router();

router.get('/:id', validateHospitalId, getHospital);
router.patch(
  '/:id/verify',
  requireAuth,
  requireRole('ADMIN'),
  validateHospitalId,
  verifyHospital
);

export default router;