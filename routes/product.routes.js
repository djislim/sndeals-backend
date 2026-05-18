const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middlewares/auth.middleware');

// GET /products — Liste des produits
router.get('/', async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 12, sort = 'recent' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = { status: 'available' };
    if (categoryId) where.categoryId = Number(categoryId);
    if (search) where.title = { contains: search };

    const orderBy =
      sort === 'prix_asc'  ? { price: 'asc' }  :
      sort === 'prix_desc' ? { price: 'desc' } :
      { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller:   { select: { id: true, name: true, location: true } },
          category: { select: { id: true, name: true, icon: true } },
          images:   { select: { id: true, url: true }, take: 1 }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('❌ GET /products :', error);
    res.status(500).json({ error: 'Erreur chargement produits', detail: error.message });
  }
});

// GET /products/seller/mes-annonces — Mes annonces
router.get('/seller/mes-annonces', authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.userId },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        images:   { select: { id: true, url: true }, take: 1 },
        _count:   { select: { images: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);

  } catch (error) {
    console.error('❌ GET /products/seller/mes-annonces :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// GET /products/:id — Détail d'un produit
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        seller:   { select: { id: true, name: true, phone: true, location: true } },
        category: { select: { id: true, name: true, icon: true } },
        images:   true
      }
    });

    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    res.json(product);

  } catch (error) {
    console.error('❌ GET /products/:id :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// POST /products — Créer une annonce
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, categoryId, location, images } = req.body;

    if (!title || !price || !categoryId) {
      return res.status(400).json({ error: 'Titre, prix et catégorie requis' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        categoryId: Number(categoryId),
        location,
        sellerId: req.userId,
        images: images?.length
          ? { create: images.map(url => ({ url })) }
          : undefined
      },
      include: {
        seller:   { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        images:   true
      }
    });

    res.status(201).json(product);

  } catch (error) {
    console.error('❌ POST /products :', error);
    res.status(500).json({ error: 'Erreur création annonce', detail: error.message });
  }
});

// PUT /products/:id — Modifier une annonce
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });
    if (existing.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Tu ne peux modifier que tes propres annonces' });
    }

    const { title, description, price, categoryId, location, status } = req.body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { title, description, price: price ? Number(price) : undefined, categoryId, location, status },
      include: {
        seller:   { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        images:   true
      }
    });

    res.json(updated);

  } catch (error) {
    console.error('❌ PUT /products/:id :', error);
    res.status(500).json({ error: 'Erreur mise à jour', detail: error.message });
  }
});

// DELETE /products/:id — Supprimer une annonce
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });
    if (existing.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Tu ne peux supprimer que tes propres annonces' });
    }

    await prisma.product.delete({ where: { id: productId } });

    res.json({ message: 'Annonce supprimée' });

  } catch (error) {
    console.error('❌ DELETE /products/:id :', error);
    res.status(500).json({ error: 'Erreur suppression', detail: error.message });
  }
});

module.exports = router;