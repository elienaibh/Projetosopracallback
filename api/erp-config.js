// API para configuração ERP - SIMPLIFICADA
// Arquivo: api/erp-config.js

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Pegar store_id do query ou body
  const store_id = req.query.store_id || req.body?.store_id || '1234567';

  try {
    if (req.method === 'GET') {
      console.log(`📝 GET - Buscando config ERP para loja: ${store_id}`);
      
      // Simular que não tem config ainda (MVP)
      return res.json({ 
        configured: false,
        message: 'Nenhuma configuração ERP encontrada (simulado)'
      });
    }
    
    if (req.method === 'POST') {
      const { erp_url, erp_token } = req.body;
      
      if (!erp_url || !erp_token) {
        return res.status(400).json({
          error: 'erp_url e erp_token são obrigatórios'
        });
      }
      
      console.log(`💾 POST - Salvando config ERP para loja: ${store_id}`);
      console.log(`🔗 URL: ${erp_url}`);
      
      // Simular sucesso (MVP)
      return res.json({
        success: true,
        message: 'Configuração ERP salva com sucesso (simulado)',
        configured: true,
        erp_url: erp_url,
        created_at: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na API ERP config:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
