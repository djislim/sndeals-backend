const router = require('express').Router();
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const { authMiddleware } = require('../middlewares/auth.middleware');
const prisma = require('../lib/prisma');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

async function uploadToImgbb(fileBuffer, fileName) {
  const formData = new FormData();
  formData.append('image', fileBuffer.toString('base64'));
  formData.append('name', fileName);
  const response = await axios.post(
    'https://api.imgbb.com/1/upload?key=' + process.env.IMGBB_API_KEY,
    formData,
    { headers: formData.getHeaders() }
  );
  return response.data.data.url;
}

router.post('/single', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucune image fournie' });
    const url = await uploadToImgbb(req.file.buffer, req.file.originalname);
    res.json({ message: 'Photo uploadee', url });
  } catch (error) {
    res.status(500).json({ error: 'Erreur upload', detail: error.message });
  }
});

router.post('/product/:id', authMiddleware, upload.array('image', 5), async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Produit non trouve' });
    if (product.sellerId !== req.userId) return res.status(403).json({ error: 'Acces refuse' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucune image