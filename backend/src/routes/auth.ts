import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artlink-dev-secret';

// 개발용 퀵 로그인 - 유저 선택 시 즉시 JWT 발급
router.post('/dev-login', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (error) {
    next(error);
  }
});

// 현재 로그인 유저 정보 조회
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// 개발용 유저 목록 (로그인 화면용)
router.get('/dev-users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatar: true }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// 프로필 사진 업데이트
router.put('/me/avatar', authenticate, async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar },
      select: { id: true, name: true, email: true, role: true, avatar: true }
    });
    res.json(user);
  } catch (error) { next(error); }
});

export default router;
