const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app  = express();
const port = process.env.PORT || 5000;

// ── Middlewares globaux ──────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────
app.use('/auth',       require('./routes/auth.routes'));
app.use('/users',      require('./routes/user.routes'));
app.use('/products',   require('./routes/product.routes'));
app.use('/categories', require('./routes/category.routes'));
app.use('/favoris',    require('./routes/favori.routes'));
app.use('/messages',   require('./routes/message.routes'));
app.use('/upload', require('./routes/upload.routes'));

// ── Route de test ────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🇸🇳 API SnDeals — Serveur opérationnel' });
});

// ── Route inexistante ────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} introuvable` });
});

// ── Erreurs globales ─────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err);
  res.status(500).json({ error: 'Erreur serveur interne', detail: err.message });
});

// ── Démarrage ────────────────────────────────────
app.listen(port, () => {
  console.log(`✅ Serveur SnDeals démarré → http://localhost:${port}`);
});