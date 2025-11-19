const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  console.log('Dashboard route hit');
  const result = await pool.query('SELECT code, url, clicks, last_clicked FROM links ORDER BY created_at DESC');
  console.log('DB query result:', result.rows.length);
  res.render('dashboard', { links: result.rows, baseUrl: process.env.BASE_URL });
});

router.get('/code/:code', async (req, res) => {
  const result = await pool.query('SELECT code, url, clicks, last_clicked FROM links WHERE code = $1', [req.params.code]);
  if (result.rows.length === 0) return res.status(404).send('Not found');
  res.render('stats', { link: result.rows[0] });
});

module.exports = router;