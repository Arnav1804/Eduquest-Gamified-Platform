const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

async function register(req, res) {
  try {
    const { name, email, phone, password, role } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] }
    });
    if (existing) {
      return res.status(400).json({ error: 'Email or phone already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: email || null, phone, passwordHash, role: role || 'student' }
    });

    res.status(201).json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { identifier, password, role } = req.body;

    const user = await prisma.user.findFirst({
      where: role === 'student' ? { phone: identifier } : { email: identifier }
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login, getMe };
