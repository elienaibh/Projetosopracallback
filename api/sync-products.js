// API para sincronização - SIMPLIFICADA
// Arquivo: api/sync-products.js

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
    if (req.method === 'POST') {
      const { direction = 'erp_to_nuvemshop' } = req.body;
      
      console.log(`🔄 POST - Sincronização para loja: ${store_id}, direção: ${direction}`);
      
      const operationId = Math.floor(Math.random() * 1000000);
      
      // Simular operação (MVP)
      return res.json({
        success: true,
        message: 'Sincronização iniciada com sucesso (simulado)',
        operation_id: operationId,
        direction: direction
      });
    }
    
    if (req.method === 'GET') {
      console.log(`📋 GET - Histórico para loja: ${store_id}`);
      
      // Simular histórico (MVP)
      const mockHistory = [
        {
          id: 1,
          operation_type: 'products_sync',
          direction: 'erp_to_nuvemshop',
          status: 'completed',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: 2,
          operation_type: 'products_sync',
          direction: 'erp_to_nuvemshop', 
          status: 'pending',
          started_at: new Date().toISOString()
        }
      ];
      
      return res.json({
        success: true,
        history: mockHistory
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na API sync:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
