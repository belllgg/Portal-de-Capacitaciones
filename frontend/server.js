const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'dist/portal-capacitaciones/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/portal-capacitaciones/browser/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});