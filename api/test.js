/**
 * Endpoint de teste simples
 * URL: /api/test
 */

module.exports = function handler(req, res) {
  console.log('🧪 Endpoint de teste acessado');
  
  res.status(200).json({
    status: 'ok',
    message: 'API funcionando perfeitamente! 🚀',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    project: 'LatAm Treasure Callback Handler'
  });
};
