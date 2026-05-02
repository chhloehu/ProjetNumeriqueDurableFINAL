const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));

// Sert les fichiers HTML, CSS, JS, images
app.use(express.static(__dirname));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/signalements', require('./routes/signalements'));
app.use('/api/admin', require('./routes/admin'));

// Page par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('projet-tortue -> http://localhost:' + PORT));
