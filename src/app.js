import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

//import searchRoutes from './routes/search.routes.js';
import authRoutes from './routes/authRoutes.js';
//import equipmentRoutes from './routes/equipment.routes.js';
//import availabilityRoutes from './routes/availability.routes.js';
//import hospitalRoutes from './routes/hospital.routes.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

//app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
//app.use('/api/equipment', equipmentRoutes);
//app.use('/api/availability', availabilityRoutes);
//app.use('/api/hospitals', hospitalRoutes);








export default app