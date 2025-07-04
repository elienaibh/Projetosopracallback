// LGPD Webhook - Solicitação de dados do cliente
// Arquivo: api/webhooks/customers-data-request.js

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { store_id, customer, data_request } = req.body;
    
    if (!store_id || !customer || !data_request) {
      return res.status(400).json({ 
        error: 'store_id, customer e data_request são obrigatórios' 
      });
    }

    console.log(`[LGPD] 📄 Processando solicitação de dados do cliente: ${customer.id} da loja: ${store_id}`);

    // Simular relatório de dados
    const dataReport = {
      customer_info: {
        id: customer.id,
        email: customer.email,
        store_id: store_id
      },
      app_data: {
        sync_history: [],
        configurations: {},
        last_activity: null
      },
      data_types: [
        'Histórico de sincronizações',
        'Configurações do app',
        'Logs de atividade'
      ],
      generated_at: new Date().toISOString(),
      retention_policy: 'Dados mantidos apenas durante uso ativo do aplicativo'
    };

    console.log(`[LGPD] ✅ Relatório de dados gerado para cliente ${customer.id}`);

    res.status(200).json({ 
      success: true,
      message: 'Relatório de dados gerado conforme LGPD',
      customer_id: customer.id,
      store_id: store_id,
      data_report: dataReport,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[LGPD] ❌ Erro ao processar data request:', error);
    
    res.status(500).json({ 
      error: 'Erro interno ao processar solicitação de dados' 
    });
  }
};
