// Middleware para servir app React no iframe Nuvemshop
// Arquivo: api/app.js

module.exports = async function handler(req, res) {
  // Headers para permitir iframe
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Redirecionar para index.html
  res.writeHead(302, {
    Location: '/'
  });
  res.end();
};
