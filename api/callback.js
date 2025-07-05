/**
 * Callback OAuth para aplicativo Nuvemshop Standalone
 * Arquivo: api/callback.js
 * Segue as boas práticas da documentação oficial
 */

const APP_ID = '19190';
const CLIENT_SECRET = 'a2fd713e74bf1d526c7e0514774cbee5f390a8302c9195b0';

module.exports = async function handler(req, res) {
  // Headers CORS para compatibilidade
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Frame-Options', 'ALLOWALL');

  // Permitir OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔗 OAuth Callback iniciado');
    console.log('📝 Query params recebidos:', req.query);
    
    const { code, state } = req.query;
    
    // Verificar se recebeu o código de autorização
    if (!code) {
      console.log('❌ Código de autorização não encontrado');
      return sendErrorPage(res, 'Código de autorização não encontrado', req.query);
    }

    console.log('✅ Código OAuth recebido:', code.substring(0, 10) + '...');
    
    // Preparar requisição para trocar code por access_token
    const tokenParams = new URLSearchParams({
      client_id: APP_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code
    });

    console.log('🔄 Trocando code por access_token...');
    
    // Fazer requisição para API da Nuvemshop
    const tokenResponse = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LatAmTreasure-App/2.0',
        'Accept': 'application/json'
      },
      body: tokenParams.toString()
    });

    console.log('📥 Resposta da API status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('❌ Erro HTTP:', tokenResponse.status, errorText);
      throw new Error(`Erro ${tokenResponse.status}: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtido com sucesso');
    
    if (!tokenData.access_token) {
      console.log('❌ Access token não encontrado na resposta:', tokenData);
      throw new Error('Access token não retornado pela API');
    }

    const { access_token, user_id, scope } = tokenData;
    
    console.log('🎉 Instalação bem-sucedida:');
    console.log('- Store ID:', user_id);
    console.log('- Scope:', scope);
    console.log('- Token (primeiros chars):', access_token.substring(0, 15) + '...');

    // Em produção, salvar no banco de dados
    // Por agora, vamos simular que foi salvo com sucesso
    
    // Redirecionar para o app com informações da instalação
    const appUrl = `/app?installed=true&store_id=${user_id}&timestamp=${Date.now()}`;
    
    console.log('🔄 Redirecionando para:', appUrl);
    
    // Página de sucesso com redirecionamento automático
    const successPage = generateSuccessPage(user_id, scope, appUrl);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(successPage);

  } catch (error) {
    console.error('❌ Erro no callback OAuth:', error);
    return sendErrorPage(res, error.message, req.query);
  }
};

function generateSuccessPage(storeId, scope, redirectUrl) {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>✅ Instalação Concluída - LatAm Treasure</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
          }
          
          .container {
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
              width: 100%;
              animation: slideUp 0.6s ease-out;
          }
          
          @keyframes slideUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
          }
          
          .success-icon {
              font-size: 80px;
              margin-bottom: 20px;
              animation: bounce 1.2s ease-in-out;
          }
          
          @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-30px); }
              60% { transform: translateY(-15px); }
          }
          
          h1 {
              color: #333;
              margin-bottom: 15px;
              font-size: 28px;
              font-weight: 700;
          }
          
          .subtitle {
              color: #666;
              margin-bottom: 30px;
              font-size: 16px;
              line-height: 1.5;
          }
          
          .info-card {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #28a745;
              margin: 20px 0;
              text-align: left;
          }
          
          .info-card h3 {
              color: #333;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 8px;
              text-transform: uppercase;
          }
          
          .info-card p {
              color: #666;
              font-family: monospace;
              font-size: 14px;
          }
          
          .countdown {
              background: #e3f2fd;
              padding: 15px;
              border-radius: 8px;
              margin: 25px 0;
              color: #1976d2;
              font-weight: 600;
          }
          
          .btn {
              background: #1a73e8;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              display: inline-block;
              margin: 10px;
              transition: all 0.3s ease;
          }
          
          .btn:hover {
              background: #1557b0;
              transform: translateY(-2px);
              box-shadow: 0 8px 16px rgba(26,115,232,0.3);
          }
          
          .btn-secondary {
              background: #6c757d;
          }
          
          .btn-secondary:hover {
              background: #545b62;
          }
          
          .loading-bar {
              width: 100%;
              height: 4px;
              background: #e0e0e0;
              border-radius: 2px;
              overflow: hidden;
              margin: 20px 0;
          }
          
          .loading-progress {
              height: 100%;
              background: linear-gradient(90deg, #1a73e8, #4285f4);
              width: 0%;
              animation: loading 3s ease-in-out forwards;
          }
          
          @keyframes loading {
              to { width: 100%; }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="success-icon">🎉</div>
          <h1>Instalação Concluída!</h1>
          
          <p class="subtitle">
              Seu aplicativo <strong>LatAm Treasure Bridge</strong> foi conectado com sucesso!
          </p>
          
          <div class="info-card">
              <h3>🏪 Loja Conectada</h3>
              <p>Store ID: ${storeId}</p>
              <p>Permissões: ${scope || 'Configuradas conforme necessário'}</p>
          </div>
          
          <div class="countdown">
              ⏱️ Redirecionando automaticamente em <span id="countdown">3</span> segundos...
          </div>
          
          <div class="loading-bar">
              <div class="loading-progress"></div>
          </div>
          
          <a href="${redirectUrl}" class="btn" id="manual-redirect">
              🚀 Acessar Aplicativo Agora
          </a>
          
          <a href="https://admin.nuvemshop.com.br" class="btn btn-secondary">
              ⚙️ Voltar ao Painel
          </a>
      </div>
      
      <script>
          console.log('✅ LatAm Treasure instalado:', {
              store_id: '${storeId}',
              timestamp: new Date().toISOString()
          });
          
          // Countdown e redirecionamento automático
          let timeLeft = 3;
          const countdownEl = document.getElementById('countdown');
          const redirectUrl = '${redirectUrl}';
          
          const timer = setInterval(() => {
              timeLeft--;
              countdownEl.textContent = timeLeft;
              
              if (timeLeft <= 0) {
                  clearInterval(timer);
                  console.log('🔄 Redirecionando para:', redirectUrl);
                  window.location.href = redirectUrl;
              }
          }, 1000);
          
          // Permitir redirecionamento manual
          document.getElementById('manual-redirect').addEventListener('click', (e) => {
              e.preventDefault();
              clearInterval(timer);
              window.location.href = redirectUrl;
          });
      </script>
  </body>
  </html>`;
}

function sendErrorPage(res, errorMessage, queryParams) {
  const errorPage = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>❌ Erro na Instalação</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
          }
          .container {
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 600px;
              width: 100%;
          }
          .error-icon { font-size: 64px; margin-bottom: 20px; color: #dc3545; }
          h1 { color: #333; margin-bottom: 15px; }
          .error-details {
              background: #f8d7da;
              color: #721c24;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
              font-family: monospace;
              font-size: 14px;
              word-break: break-all;
          }
          .btn {
              background: #6c757d;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
              margin: 10px;
          }
          .btn:hover { background: #545b62; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="error-icon">❌</div>
          <h1>Erro na Instalação</h1>
          <p>Ocorreu um problema ao conectar o aplicativo.</p>
          
          <div class="error-details">
              <strong>Erro:</strong> ${errorMessage}<br>
              <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
              <strong>Parâmetros:</strong> ${JSON.stringify(queryParams)}
          </div>
          
          <a href="/app" class="btn">🔄 Tentar Novamente</a>
          <a href="https://admin.nuvemshop.com.br" class="btn">⚙️ Voltar ao Painel</a>
      </div>
  </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(500).send(errorPage);
}
