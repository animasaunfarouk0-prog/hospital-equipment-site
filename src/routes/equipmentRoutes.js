import { Router } from 'express';
import { validateEquipmentQuery } from '../middlewares/equipmentMiddleware.js';
import { listEquipment } from '../controllers/equipmentController.js';

const router = Router();

router.get('/', validateEquipmentQuery, listEquipment);

export default router;