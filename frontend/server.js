const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Debug: Ver qué archivos existen
console.log('📁 Current directory:', __dirname);
console.log('📂 Checking dist folder...');

const distPath = path.join(__dirname, 'dist/portal-capacitaciones/browser');
console.log('🔍 Looking for files in:', distPath);

if (fs.existsSync(distPath)) {
  console.log('✅ Dist folder found!');
  console.log('📄 Files:', fs.readdirSync(distPath));
} else {
  console.log('❌ Dist folder NOT found!');
  console.log('📂 Available folders:', fs.readdirSync(__dirname));
  
  // Buscar en otras ubicaciones posibles
  const altPath = path.join(__dirname, 'dist');
  if (fs.existsSync(altPath)) {
    console.log('📁 Found dist in:', fs.readdirSync(altPath));
  }
}

// Servir archivos estáticos
app.use(express.static(distPath));

// Todas las rutas retornan index.html
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('🔍 Serving:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index.html not found at: ' + indexPath);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
