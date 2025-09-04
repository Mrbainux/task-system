// server.js
require('dotenv').config(); // charge les variables d'environnement depuis .env

const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');

// Models
const Task = require('./models/Task');

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// --- Configuration MongoDB ---
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("❌ Erreur: la variable MONGODB_URI n'est pas définie !");
  process.exit(1);
}
console.log("🔗 Mongo URI:", mongoUri);

mongoose.connect(mongoUri, {
  // Les options useNewUrlParser et useUnifiedTopology sont maintenant ignorées avec Mongoose 7
})
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

// --- Route recherche ---
app.get('/search', async (req, res) => {
  const { category, city } = req.query;
  let filter = {};
  if(category) filter.category = category;
  if(city) filter.city = new RegExp(city, 'i');

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.render('index', { tasks });
});

// --- Routes principales ---
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

// --- Page d'accueil ---
app.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.render('index', { tasks });
});

// --- Démarrage serveur ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
// --- Route temporaire pour lister les fichiers uploads ---
const fs = require('fs');

app.get('/uploads-list', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.send('Erreur: ' + err);
    res.send(files); // Affiche la liste des fichiers
  });
});
