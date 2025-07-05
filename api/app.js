/**
 * Entry point do aplicativo Nuvemshop Standalone
 * Serve o React app com caminhos corretos
 */

module.exports = async function handler(req, res) {
  try {
    console.log('🚀 Servindo app standalone...');
    
    // Headers obrigatórios para apps standalone
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // HTML do React app com caminhos absolutos
    const html = `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta name="theme-color" content="#000000"/>
    <meta name="description" content="LatAm Treasure Bridge - Integração Nuvemshop x ERP"/>
    <title>LatAm Treasure Bridge</title>
    <script defer="defer" src="https://projetosopracallback.vercel.app/static/js/main.cffffc7b.js"></script>
    <link href="https://projetosopracallback.vercel.app/static/css/main.8449ee06.css" rel="stylesheet">
</head>
<body>
    <noscript>Você precisa habilitar JavaScript para executar este app.</noscript>
    <div id="root"></div>
</body>
</html>`;
    
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    
    const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Erro - LatAm Treasure</title>
        <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f7fa; }
            .container { background: white; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; }
            .error { color: red; margin: 20px; }
            .btn { background: #1a73e8; color: white; padding: 12px 24px; border: none; border-radius: 8px; margin: 10px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏆 LatAm Treasure Bridge</h1>
            <p class="error">❌ Erro ao carregar: ${error.message}</p>
            <button onclick="location.reload()" class="btn">🔄 Tentar Novamente</button>
            <a href="https://projetosopracallback.vercel.app" class="btn">🏠 Ir para Home</a>
        </div>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    return res.status(500).send(errorHtml);
  }
};
