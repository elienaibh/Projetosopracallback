/**
 * Entry point do aplicativo Nuvemshop
 * Serve o React app diretamente (standalone mode)
 * Arquivo: api/app.js
 */

const { readFileSync } = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  try {
    // Ler o arquivo HTML buildado do React
    const htmlPath = path.join(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    
    // Headers para permitir iframe se necessário (futuro)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('🚀 Servindo React app para:', req.headers['user-agent']);
    
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('❌ Erro ao servir app:', error);
    
    // Fallback HTML simples em caso de erro
    const fallbackHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LatAm Treasure Bridge</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: #f5f7fa;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
            }
            .error { color: #d93025; }
            .btn {
                background: #1a73e8;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏆 LatAm Treasure Bridge</h1>
            <p class="error">Erro ao carregar aplicativo</p>
            <p>Detalhes: ${error.message}</p>
            <a href="/" class="btn">🔄 Tentar Novamente</a>
            <a href="https://admin.nuvemshop.com.br" class="btn">⚙️ Voltar ao Painel</a>
        </div>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(fallbackHtml);
  }
};
