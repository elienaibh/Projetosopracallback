// Endpoint para forçar abertura em nova aba
// Arquivo: api/app.js

module.exports = async function handler(req, res) {
  // HTML que força abertura em nova aba
  const redirectHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>LatAm Treasure Bridge</title>
    <meta charset="utf-8">
  </head>
  <body>
    <script>
      // Detectar se está no iframe
      if (window.parent !== window) {
        // Está no iframe - abrir em nova aba
        window.parent.open('https://projetosopracallback.vercel.app', '_blank');
        
        // Mostrar mensagem no iframe
        document.body.innerHTML = \`
          <div style="
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            font-family: Arial, sans-serif;
            text-align: center;
            background: #f5f7fa;
          ">
            <div style="
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 16px rgba(0,0,0,0.1);
              max-width: 400px;
            ">
              <h2 style="color: #1a73e8; margin-bottom: 20px;">
                🚀 LatAm Treasure Bridge
              </h2>
              <p style="color: #333; margin-bottom: 20px;">
                O aplicativo foi aberto em uma nova aba!
              </p>
              <p style="color: #666; font-size: 14px;">
                Se não abriu automaticamente, 
                <a href="https://projetosopracallback.vercel.app" target="_blank" style="color: #1a73e8;">
                  clique aqui
                </a>
              </p>
            </div>
          </div>
        \`;
      } else {
        // Não está no iframe - redirecionar normalmente
        window.location.href = '/';
      }
    </script>
  </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  return res.status(200).send(redirectHTML);
};
