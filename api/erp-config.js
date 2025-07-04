// API para configuração ERP
// Arquivo: api/erp-config.js

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { store_id } = req.query;

  try {
    if (req.method === 'GET') {
      // Buscar configuração ERP (simulado por enquanto)
      console.log(`📝 Buscando config ERP para loja: ${store_id}`);
      
      // TODO: Implementar banco real - por ora simular
      const hasConfig = false; // Simular que não tem config ainda
      
      if (hasConfig) {
        return res.json({
          configured: true,
          erp_url: 'http://localhost:8001',
          created_at: new Date().toISOString()
        });
      } else {
        return res.json({ configured: false });
      }
    }
    
    if (req.method === 'POST') {
      // Salvar configuração ERP
      const { erp_url, erp_token } = req.body;
      
      if (!erp_url || !erp_token) {
        return res.status(400).json({
          error: 'erp_url e erp_token são obrigatórios'
        });
      }
      
      console.log(`💾 Salvando config ERP para loja: ${store_id}`);
      console.log(`🔗 URL: ${erp_url}`);
      
      // TODO: Salvar no banco real
      // Por ora apenas simular sucesso
      
      return res.json({
        success: true,
        message: 'Configuração ERP salva com sucesso'
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na API ERP config:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
