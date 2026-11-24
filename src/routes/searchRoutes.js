import { Router } from 'express';
import { validateSearch } from '../middlewares/searchMiddleware.js';
import { search } from '../controllers/searchController.js';

const router = Router();

router.get('/', validateSearch, search);

export default router;