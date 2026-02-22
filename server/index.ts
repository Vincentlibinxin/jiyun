import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import { authMiddleware } from './middleware/auth';
import { getUserById } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.1.35:3000'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/user/profile', authMiddleware, async (req: any, res) => {
  try {
    const user = getUserById.get(req.userId) as any;
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        real_name: user.real_name,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
