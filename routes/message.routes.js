const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middlewares/auth.middleware');

// POST /messages/:productId — Demarrer ou continuer une conversation
router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'Message vide' });

    // Verifier que le produit existe
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Produit non trouve' });

    // Empecher le vendeur de se parler a lui-meme
    if (product.sellerId === req.userId) {
      return res.status(400).json({ error: 'Tu ne peux pas te contacter toi-meme' });
    }

    // Trouver ou creer la conversation
    let conversation = await prisma.conversation.findUnique({
      where: { productId_buyerId: { productId, buyerId: req.userId } }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { productId, buyerId: req.userId, sellerId: product.sellerId }
      });
    }

    // Creer le message
    const message = await prisma.message.create({
      data: { content, senderId: req.userId, conversationId: conversation.id },
      include: { sender: { select: { id: true, name: true } } }
    });

    res.status(201).json({ conversation, message });

  } catch (error) {
    console.error('POST /messages/:productId :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// GET /messages/conversations — Mes conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: req.userId }, { sellerId: req.userId }]
      },
      include: {
        product: { select: { id: true, title: true, price: true, images: { take: 1 } } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(conversations);

  } catch (error) {
    console.error('GET /messages/conversations :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// GET /messages/conversation/:id — Messages d une conversation
router.get('/conversation/:id', authMiddleware, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        product: { select: { id: true, title: true, price: true, images: { take: 1 } } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) return res.status(404).json({ error: 'Conversation non trouvee' });

    // Verifier que l utilisateur fait partie de la conversation
    if (conversation.buyerId !== req.userId && conversation.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Acces refuse' });
    }

    res.json(conversation);

  } catch (error) {
    console.error('GET /messages/conversation/:id :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// POST /messages/conversation/:id — Repondre dans une conversation
router.post('/conversation/:id', authMiddleware, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'Message vide' });

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) return res.status(404).json({ error: 'Conversation non trouvee' });

    if (conversation.buyerId !== req.userId && conversation.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Acces refuse' });
    }

    const message = await prisma.message.create({
      data: { content, senderId: req.userId, conversationId },
      include: { sender: { select: { id: true, name: true } } }
    });

    // Mettre a jour updatedAt de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(message);

  } catch (error) {
    console.error('POST /messages/conversation/:id :', error);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

module.exports = router;
