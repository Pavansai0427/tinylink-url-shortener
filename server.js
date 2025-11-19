require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/pages'));

// Health check
app.get('/healthz', (req, res) => res.json({ ok: true, version: '1.0' }));

// Redirect
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  const result = await pool.query('SELECT url FROM links WHERE code = $1', [code]);
  if (result.rows.length === 0) return res.status(404).send('Not found');
  await pool.query('UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1', [code]);
  res.redirect(302, result.rows[0].url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log('Server started, routes loaded');