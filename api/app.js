/**
 * Entry point do aplicativo Nuvemshop Standalone
 * Serve exatamente o mesmo conteúdo da raiz
 */

const { readFileSync } = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  try {
    console.log('🚀 Servindo /app - copiando conteúdo da raiz...');
    
    // Headers obrigatórios para apps standalone
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Ler EXATAMENTE o mesmo arquivo que funciona na raiz
    const htmlPath = path.join(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).send(`<h1>Erro: ${error.message}</h1>`);
  }
};
