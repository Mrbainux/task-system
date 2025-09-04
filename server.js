require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const fs = require('fs');

const Task = require('./models/Task');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// --- MongoDB ---
const mongoUri = process.env.MONGODB_URI;
if(!mongoUri){
  console.error("❌ MONGODB_URI non défini !");
  process.exit(1);
}
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');

// --- Health Check (pour Railway) ---
app.get('/health', (req, res) => res.send('OK'));

// --- Recherche ---
app.get('/search', async (req, res) => {
  const { category, city } = req.query;
  let filter = {};
  if(category) filter.category = category;
  if(city) filter.city = new RegExp(city, 'i');

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.render('index', { tasks });
});

// --- Routes ---
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

// --- Accueil ---
app.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.render('index', { tasks });
});
// Lister les fichiers uploadés
app.get('/uploads-list', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if(err) return res.send('Erreur: ' + err);
    res.send(files); // Affiche les noms des fichiers
  });
});


// --- Lancement serveur ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
