const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// LA RUTA CORRECTA (sin /browser al final)
const distPath = path.join(__dirname, 'dist/portal-capacitaciones');

console.log('📁 Serving files from:', distPath);

// Servir archivos estáticos
app.use(express.static(distPath));

// Todas las rutas retornan index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
