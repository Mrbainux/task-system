// server.js
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

// --- Connexion MongoDB Atlas ---
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb+srv://Taskrabitt:saadsaad@cluster0.mmf7o3u.mongodb.net/task-system?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => console.log('MongoDB connecté'))
.catch(err => console.log('Erreur MongoDB:', err));

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(session({
  secret: 'secret123',
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
