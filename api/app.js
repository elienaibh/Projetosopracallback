/**
 * Entry point do aplicativo Nuvemshop
 * Serve o React app compatível com iframe
 * Arquivo: api/app.js
 */

const { readFileSync } = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  try {
    console.log('🚀 Serving app for:', req.headers['user-agent']);
    console.log('🔍 Referer:', req.headers.referer);
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
    
    // Ler o arquivo HTML buildado do React
    const htmlPath = path.join(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    
    // Headers para permitir iframe da Nuvemshop
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Permitir iframe de mesma origem
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *.nuvemshop.com.br *.tiendanube.com *.nuvemshop.com;");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Detectar se está sendo carregado via Nuvemshop
    const referer = req.headers.referer || '';
    const isFromNuvemshop = referer.includes('nuvemshop') || referer.includes('tiendanube');
    
    if (isFromNuvemshop) {
      console.log('✅ Carregando via Nuvemshop iframe');
    } else {
      console.log('🌐 Carregamento direto');
    }
    
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('❌ Erro ao servir app:', error);
    
    // Página de erro para debug
    const errorHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro - LatAm Treasure Bridge</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: #f5f7fa;
                margin: 0;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
            }
            .error { color: #d93025; margin: 20px 0; }
            .debug { 
                background: #f8f9fa; 
                padding: 20px; 
                border-radius: 8px; 
                text-align: left; 
                font-family: monospace;
                font-size: 12px;
                margin: 20px 0;
            }
            .btn {
                background: #1a73e8;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
                cursor: pointer;
            }
            .btn:hover { background: #1557b0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏆 LatAm Treasure Bridge</h1>
            <p class="error">❌ Erro ao carregar aplicativo</p>
            
            <div class="debug">
                <strong>Debug Info:</strong><br>
                Error: ${error.message}<br>
                Time: ${new Date().toISOString()}<br>
                User-Agent: ${req.headers['user-agent'] || 'N/A'}<br>
                Referer: ${req.headers.referer || 'N/A'}
            </div>
            
            <button onclick="location.reload()" class="btn">🔄 Recarregar</button>
            <a href="https://projetosopracallback.vercel.app/app" target="_blank" class="btn">🌐 Abrir Diretamente</a>
            
            <script>
                console.error('App loading error:', '${error.message}');
                console.log('Headers:', ${JSON.stringify(req.headers)});
                
                // Tentar recarregar automaticamente após 5 segundos
                setTimeout(() => {
                    console.log('Auto-reloading...');
                    location.reload();
                }, 5000);
            </script>
        </div>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(500).send(errorHtml);
  }
};
