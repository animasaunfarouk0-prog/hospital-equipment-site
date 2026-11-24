
import { Router } from 'express';
import { loginLimiter, validateRegister, validateLogin, } from '../middlewares/authMiddleware.js';
import { registerHospital, login } from '../controllers/authController.js';

const router = Router();

router.post('/register-hospital', validateRegister, registerHospital);
router.post('/login', loginLimiter, validateLogin, login);

export default router;
