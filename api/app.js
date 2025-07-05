/**
 * Entry point do aplicativo Nuvemshop Standalone
 * Segue documentação: https://dev.nuvemshop.com.br/docs/applications/standalone
 */

const { readFileSync } = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  try {
    // Headers obrigatórios para apps standalone Nuvemshop
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    console.log('🚀 App standalone carregando...');
    console.log('📋 Referer:', req.headers.referer);
    
    // Ler arquivo HTML do React app
    const htmlPath = path.join(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    
    const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Erro - LatAm Treasure</title>
        <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .error { color: red; margin: 20px; }
        </style>
    </head>
    <body>
        <h1>🏆 LatAm Treasure Bridge</h1>
        <p class="error">Erro ao carregar: ${error.message}</p>
        <button onclick="location.reload()">🔄 Tentar Novamente</button>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    return res.status(500).send(errorHtml);
  }
};
