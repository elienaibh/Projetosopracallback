/**
 * Callback OAuth para aplicativo Nuvemshop
 * Arquivo: api/callback.js
 * URL: https://app.latamtreasure.com/api/callback
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Configurações do aplicativo Nuvemshop
const APP_ID = '19190';
const CLIENT_SECRET = 'a2fd713e74bf1d526c7e0514774cbee5f390a8302c9195b0';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Permitir OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🚀 Callback iniciado');
    console.log('📝 Query params:', req.query);
    console.log('🔍 Method:', req.method);
    console.log('🌐 Headers:', req.headers);

    // Verificar se recebeu o código de autorização
    const { code } = req.query;
    
    if (!code) {
      console.log('❌ Código de autorização não encontrado');
      return res.status(400).json({ 
        error: 'Código de autorização não encontrado',
        received_params: req.query,
        expected: 'code parameter'
      });
    }

    console.log('✅ Código recebido:', code);
    console.log('🔄 Iniciando troca por access_token...');

    // Preparar dados para a requisição
    const tokenData = new URLSearchParams({
      client_id: APP_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code
    });

    console.log('📤 Enviando requisição para Nuvemshop...');
    
    // Fazer requisição para obter access_token
    const tokenResponse = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LatAmTreasure-App/1.0'
      },
      body: tokenData
    });

    const responseText = await tokenResponse.text();
    console.log('📥 Resposta status:', tokenResponse.status);
    console.log('📄 Resposta completa:', responseText);

    let tokenInfo;
    try {
      tokenInfo = JSON.parse(responseText);
    } catch (parseError) {
      console.log('❌ Erro ao parsear JSON:', parseError);
      throw new Error(`Resposta inválida da API: ${responseText}`);
    }

    if (!tokenResponse.ok) {
      console.log('❌ Erro na API Nuvemshop:', tokenInfo);
      throw new Error(`Erro ${tokenResponse.status}: ${JSON.stringify(tokenInfo)}`);
    }

    // Verificar se recebeu access_token
    if (!tokenInfo.access_token) {
      console.log('❌ Access token não recebido:', tokenInfo);
      throw new Error(`Token não encontrado na resposta: ${JSON.stringify(tokenInfo)}`);
    }

    const { access_token, user_id, scope, token_type } = tokenInfo;
    
    console.log('🎉 Sucesso! Dados recebidos:');
    console.log('- Store ID:', user_id);
    console.log('- Scope:', scope);
    console.log('- Token Type:', token_type);
    console.log('- Access Token (primeiros 20 chars):', access_token.substring(0, 20) + '...');

    // Salvar dados (em produção usar banco de dados)
    const installationData = {
      store_id: user_id,
      access_token: access_token,
      scope: scope,
      token_type: token_type,
      app_id: APP_ID,
      installed_at: new Date().toISOString(),
      status: 'active'
    };

    // Log para monitoramento
    console.log('💾 Dados da instalação salvos:', {
      store_id: user_id,
      scope: scope,
      timestamp: installationData.installed_at
    });

    // Página HTML de sucesso
    const successPage = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>✅ Aplicativo Instalado - LatAm Treasure</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
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
                max-width: 600px;
                width: 100%;
                animation: slideUp 0.5s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .success-icon {
                font-size: 80px;
                margin-bottom: 20px;
                animation: bounce 1s ease-in-out;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-30px);
                }
                60% {
                    transform: translateY(-15px);
                }
            }
            
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 32px;
                font-weight: 700;
            }
            
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 18px;
                line-height: 1.5;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 30px 0;
            }
            
            .info-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #28a745;
                text-align: left;
            }
            
            .info-card h3 {
                color: #333;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .info-card p {
                color: #666;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 16px;
                word-break: break-all;
            }
            
            .permissions {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 12px;
                margin: 30px 0;
                border-left: 4px solid #2196f3;
            }
            
            .permissions h3 {
                color: #1976d2;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .permissions p {
                color: #333;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .actions {
                margin-top: 40px;
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 14px 28px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary {
                background: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background: #0056b3;
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0,123,255,0.3);
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #545b62;
                transform: translateY(-2px);
            }
            
            .timestamp {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #999;
                font-size: 12px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            
            .status-badge {
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-left: 10px;
            }
            
            @media (max-width: 600px) {
                .container {
                    padding: 30px 20px;
                }
                
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .actions {
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">🎉</div>
            <h1>Instalação Concluída!</h1>
            <span class="status-badge">ATIVO</span>
            
            <p class="subtitle">
                Seu aplicativo <strong>LatAm Treasure</strong> foi conectado com sucesso à sua loja Nuvemshop!
            </p>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3>🏪 Store ID</h3>
                    <p>${user_id}</p>
                </div>
                
                <div class="info-card">
                    <h3>🔑 Token Type</h3>
                    <p>${token_type || 'bearer'}</p>
                </div>
            </div>
            
            <div class="permissions">
                <h3>🛡️ Permissões Concedidas:</h3>
                <p>${scope || 'Permissões padrão configuradas'}</p>
            </div>
            
            <div class="actions">
                <a href="https://latamtreasure.com" class="btn btn-primary">
                    🏠 Voltar para a Loja
                </a>
                <a href="https://admin.nuvemshop.com.br" class="btn btn-secondary">
                    ⚙️ Painel Admin
                </a>
            </div>
            
            <div class="timestamp">
                📅 Instalado em: ${new Date().toLocaleString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}<br>
                🆔 App ID: ${APP_ID} | 🔗 Callback Version: 1.0
            </div>
        </div>
        
        <script>
            // Analytics/tracking opcional
            console.log('✅ Aplicativo LatAm Treasure instalado:', {
                store_id: '${user_id}',
                timestamp: new Date().toISOString(),
                app_id: '${APP_ID}'
            });
            
            // Auto-redirect após 30 segundos (opcional)
            setTimeout(() => {
                const redirect = confirm('Deseja ser redirecionado para sua loja?');
                if (redirect) {
                    window.location.href = 'https://latamtreasure.com';
                }
            }, 30000);
        </script>
    </body>
    </html>`;

    // Retornar página de sucesso
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(successPage);

  } catch (error) {
    console.error('❌ Erro no callback:', error);
    
    // Página de erro detalhada
    const errorPage = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>❌ Erro na Instalação - LatAm Treasure</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
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
            
            .error-icon {
                font-size: 64px;
                margin-bottom: 20px;
                color: #dc3545;
            }
            
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 28px;
            }
            
            .error-details {
                background: #f8d7da;
                color: #721c24;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #f5c6cb;
                text-align: left;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                line-height: 1.6;
                word-break: break-all;
            }
            
            .btn {
                background: #6c757d;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                margin: 10px;
                transition: background 0.3s;
            }
            
            .btn:hover {
                background: #545b62;
            }
            
            .debug-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                text-align: left;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">❌</div>
            <h1>Erro na Instalação</h1>
            <p>Ocorreu um problema ao conectar o aplicativo à sua loja.</p>
            
            <div class="error-details">
                <strong>Detalhes do erro:</strong><br>
                ${error.message}
            </div>
            
            <div class="debug-info">
                <strong>Informações de debug:</strong><br>
                Timestamp: ${new Date().toISOString()}<br>
                App ID: ${APP_ID}<br>
                Query params: ${JSON.stringify(req.query)}
            </div>
            
            <p>Tente instalar novamente ou entre em contato com o suporte.</p>
            
            <a href="https://latamtreasure.com" class="btn">🏠 Voltar para a Loja</a>
            <a href="https://admin.nuvemshop.com.br" class="btn">⚙️ Tentar Novamente</a>
        </div>
        
        <script>
            console.error('❌ Erro na instalação do app:', {
                error: '${error.message}',
                timestamp: new Date().toISOString(),
                app_id: '${APP_ID}'
            });
        </script>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(errorPage);
  }
}
