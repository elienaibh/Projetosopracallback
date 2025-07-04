// API para sincronização de produtos
// Arquivo: api/sync-products.js

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
    if (req.method === 'POST') {
      // Sincronizar produtos
      const { direction = 'erp_to_nuvemshop' } = req.body;
      
      console.log(`🔄 Iniciando sincronização para loja: ${store_id}`);
      console.log(`📊 Direção: ${direction}`);
      
      // TODO: Implementar sincronização real
      // Por ora simular operação
      
      const operationId = Math.floor(Math.random() * 1000000);
      
      // Simular delay de processamento
      setTimeout(() => {
        console.log(`✅ Sincronização ${operationId} concluída`);
      }, 2000);
      
      return res.json({
        success: true,
        message: 'Sincronização iniciada com sucesso',
        operation_id: operationId,
        direction: direction
      });
    }
    
    if (req.method === 'GET') {
      // Buscar histórico de sincronizações
      console.log(`📋 Buscando histórico para loja: ${store_id}`);
      
      // TODO: Implementar banco real - por ora simular
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
