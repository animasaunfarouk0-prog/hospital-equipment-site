import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

// A hospital signs up: creates the hospital (unverified) and its first user
export const registerHospital = async (req, res) => {
  const {
    email, password, hospitalName, address, state, lga, lat, lng, phone,
  } = req.body;

  const missing =
    !email || !password || password.length < 8 ||
    !hospitalName || !address || !state ||
    typeof lat !== 'number' || typeof lng !== 'number';
  if (missing) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const hospital = await tx.hospital.create({
      data: { name: hospitalName, address, state, lga, lat, lng, phone },
    });
    await tx.user.create({
      data: {
        email,
        passwordHash,
        role: 'HOSPITAL_STAFF',
        hospitalId: hospital.id,
      },
    });
  });

  res.status(201).json({
    message: 'Registered. Your hospital appears in search once it is verified.',
  });
};

// Log in and receive a token
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email || '' } });
  const ok = user && (await bcrypt.compare(password || '', user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Wrong email or password' });

  const token = jwt.sign(
    { id: user.id, role: user.role, hospitalId: user.hospitalId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, role: user.role, hospitalId: user.hospitalId });
};