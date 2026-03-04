import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// 내 찜 목록 조회
router.get('/', authenticate, async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        gallery: { select: { id: true, name: true, mainImage: true, rating: true } },
        exhibition: {
          select: { id: true, title: true, gallery: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(favorites);
  } catch (error) { next(error); }
});

// 찜 토글
router.post('/toggle', authenticate, async (req, res, next) => {
  try {
    const { galleryId, exhibitionId } = req.body;

    if (galleryId) {
      const existing = await prisma.favorite.findUnique({
        where: { userId_galleryId: { userId: req.user!.id, galleryId } }
      });
      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return res.json({ favorited: false });
      }
      await prisma.favorite.create({ data: { userId: req.user!.id, galleryId } });
      return res.json({ favorited: true });
    }

    if (exhibitionId) {
      const existing = await prisma.favorite.findUnique({
        where: { userId_exhibitionId: { userId: req.user!.id, exhibitionId } }
      });
      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return res.json({ favorited: false });
      }
      await prisma.favorite.create({ data: { userId: req.user!.id, exhibitionId } });
      return res.json({ favorited: true });
    }

    res.status(400).json({ error: 'galleryId 또는 exhibitionId가 필요합니다.' });
  } catch (error) { next(error); }
});

export default router;
