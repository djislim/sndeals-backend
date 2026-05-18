const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// GET /categories — Liste toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('❌ GET /categories :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// POST /categories — Créer une catégorie (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, icon } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Nom et slug requis' });
    }

    const category = await prisma.category.create({
      data: { name, slug, icon }
    });

    res.status(201).json(category);

  } catch (error) {
    console.error('❌ POST /categories :', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Cette catégorie existe déjà' });
    }
    res.status(500).json({ error: 'Erreur création catégorie', detail: error.message });
  }
});

// DELETE /categories/:id — Supprimer une catégorie (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    console.error('❌ DELETE /categories/:id :', error);
    res.status(500).json({ error: 'Erreur suppression', detail: error.message });
  }
});

module.exports = router;
