const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// GET /users/profile — Mon profil
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, name: true,
        role: true, phone: true, location: true, createdAt: true,
        _count: { select: { products: true } }
      }
    });

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(user);

  } catch (error) {
    console.error('❌ GET /users/profile :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// PUT /users/profile — Modifier mon profil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { name, phone, location },
      select: { id: true, email: true, name: true, phone: true, location: true, role: true }
    });

    res.json(updated);

  } catch (error) {
    console.error('❌ PUT /users/profile :', error);
    res.status(500).json({ error: 'Erreur mise à jour profil', detail: error.message });
  }
});

// GET /users — Tous les utilisateurs (admin uniquement)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true,
        role: true, phone: true, location: true, createdAt: true,
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);

  } catch (error) {
    console.error('❌ GET /users :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

module.exports = router;