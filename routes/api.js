const express = require('express');
const router = express.Router();
const pool = require('../db');
const isURL = require('validator/lib/isURL');

router.post('/links', async (req, res) => {
  const { url, code } = req.body;
  if (!url || !isURL(url, { protocols: ['http', 'https'] })) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  const generatedCode = code || Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    await pool.query('INSERT INTO links (code, url) VALUES ($1, $2)', [generatedCode, url]);
    res.status(201).json({ code: generatedCode, url });
  } catch (err) {
    if (err.code === '23505') res.status(409).json({ error: 'Code already exists' });
    else res.status(500).json({ error: 'Database error' });
  }
});

router.get('/links', async (req, res) => {
  const result = await pool.query('SELECT code, url, clicks, last_clicked FROM links ORDER BY created_at DESC');
  res.json(result.rows);
});

router.get('/links/:code', async (req, res) => {
  const result = await pool.query('SELECT code, url, clicks, last_clicked FROM links WHERE code = $1', [req.params.code]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

router.delete('/links/:code', async (req, res) => {
  const result = await pool.query('DELETE FROM links WHERE code = $1', [req.params.code]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

module.exports = router;