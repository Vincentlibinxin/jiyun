import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByUsername, getUserByPhone, getUserById } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rongtai-secret-key-2026';
const JWT_EXPIRES = '7d';

interface AuthRequest extends Request {
  userId?: number;
}

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, phone, email } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    if (username.length < 3 || username.length > 20) {
      res.status(400).json({ error: '用户名长度需在3-20个字符之间' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: '密码长度至少6个字符' });
      return;
    }

    const existingUser = getUserByUsername.get(username);
    if (existingUser) {
      res.status(400).json({ error: '用户名已存在' });
      return;
    }

    if (phone) {
      const existingPhone = getUserByPhone.get(phone);
      if (existingPhone) {
        res.status(400).json({ error: '手机号已被注册' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = createUser.run(username, hashedPassword, phone || null, email || null, null, null);
    const userId = result.lastInsertRowid as number;
    const token = generateToken(userId);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        phone: phone || null,
        email: email || null
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    const user = getUserByUsername.get(username) as any;
    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: '登录成功',
      token,
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
    console.error('Login error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未登录' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = getUserById.get(decoded.userId) as any;
    if (!user) {
      res.status(401).json({ error: '用户不存在' });
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
    res.status(401).json({ error: '登录已过期' });
  }
});

export default router;
