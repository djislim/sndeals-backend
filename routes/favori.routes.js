const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middlewares/auth.middleware');

// POST /favoris/:productId — Ajouter aux favoris
router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    const favori = await prisma.favori.create({
      data: { userId: req.userId, productId }
    });

    res.status(201).json({ message: 'Ajouté aux favoris', favori });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Déjà dans tes favoris' });
    }
    console.error('❌ POST /favoris :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// DELETE /favoris/:productId — Retirer des favoris
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    await prisma.favori.delete({
      where: {
        userId_productId: { userId: req.userId, productId }
      }
    });

    res.json({ message: 'Retiré des favoris' });

  } catch (error) {
    console.error('❌ DELETE /favoris :', error);
    res.status(404).json({ error: 'Favori non trouvé' });
  }
});

// GET /favoris — Mes favoris
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favoris = await prisma.favori.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, icon: true } },
            images:   { select: { id: true, url: true }, take: 1 },
            seller:   { select: { id: true, name: true, location: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(favoris);

  } catch (error) {
    console.error('❌ GET /favoris :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

module.exports = router;
