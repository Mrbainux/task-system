const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();

// --- Connexion MongoDB ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connecté'))
.catch(err => console.log('Erreur MongoDB:', err));

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');

// --- Routes ---
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

app.get('/search', async (req, res) => {
  const { category, city } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(city, 'i');
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.render('index', { tasks });
});

app.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.render('index', { tasks });
});

// --- Lancement serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur port ${PORT}`));
