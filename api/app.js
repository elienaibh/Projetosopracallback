/**
 * Entry point que FORÇA abertura em nova aba
 * Múltiplas estratégias para contornar restrições cross-origin
 */

module.exports = async function handler(req, res) {
  try {
    console.log('🚀 App carregando...');
    
    // HTML com múltiplas estratégias para abrir nova aba
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>LatAm Treasure Bridge</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f7fa;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
        }
        .btn {
            background: #1a73e8;
            color: white;
            padding: 14px 28px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: #1557b0;
        }
        .status {
            color: #666;
            font-size: 14px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="color: #1a73e8; margin-bottom: 20px;">
            🚀 LatAm Treasure Bridge
        </h2>
        <div id="status" class="status">
            🔄 Detectando ambiente...
        </div>
        <div id="content">
            <p style="color: #333; margin-bottom: 20px;">
                Redirecionando para o aplicativo...
            </p>
        </div>
    </div>

    <script>
        const status = document.getElementById('status');
        const content = document.getElementById('content');
        const appUrl = 'https://app.latamtreasure.com/';
        
        function updateStatus(message) {
            status.textContent = message;
            console.log(message);
        }
        
        function showManualOption() {
            content.innerHTML = \`
                <p style="color: #333; margin-bottom: 20px;">
                    ⚠️ Não foi possível abrir automaticamente
                </p>
                <a href="\${appUrl}" target="_blank" class="btn">
                    🚀 Abrir Aplicativo Manualmente
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    Clique no botão acima para acessar o aplicativo
                </p>
            \`;
        }
        
        // Estratégia 1: Detectar se está no iframe
        function detectIframe() {
            return window.self !== window.top;
        }
        
        // Estratégia 2: Tentar múltiplas formas de abrir nova aba
        function tryOpenNewTab() {
            const strategies = [
                // Estratégia A: window.open direto
                () => {
                    updateStatus('🔄 Tentativa 1: window.open direto...');
                    return window.open(appUrl, '_blank');
                },
                
                // Estratégia B: window.top.open
                () => {
                    updateStatus('🔄 Tentativa 2: window.top.open...');
                    return window.top.open(appUrl, '_blank');
                },
                
                // Estratégia C: location.href no próprio iframe
                () => {
                    updateStatus('🔄 Tentativa 3: location.href...');
                    window.location.href = appUrl;
                    return true;
                },
                
                // Estratégia D: postMessage para parent
                () => {
                    updateStatus('🔄 Tentativa 4: postMessage...');
                    try {
                        window.parent.postMessage({
                            type: 'OPEN_APP',
                            url: appUrl
                        }, '*');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            ];
            
            for (let i = 0; i < strategies.length; i++) {
                try {
                    const result = strategies[i]();
                    if (result) {
                        updateStatus(\`✅ Sucesso na tentativa \${i + 1}!\`);
                        return true;
                    }
                } catch (error) {
                    console.warn(\`Estratégia \${i + 1} falhou:\`, error.message);
                }
            }
            
            return false;
        }
        
        // Inicialização
        window.addEventListener('load', function() {
            if (detectIframe()) {
                updateStatus('🎯 Detectado: executando dentro de iframe');
                
                // Tentar abrir nova aba
                const success = tryOpenNewTab();
                
                if (!success) {
                    updateStatus('❌ Todas as tentativas falharam');
                    showManualOption();
                } else {
                    // Sucesso - mostrar mensagem de confirmação
                    setTimeout(() => {
                        content.innerHTML = \`
                            <p style="color: #28a745; margin-bottom: 20px;">
                                ✅ Aplicativo aberto em nova aba!
                            </p>
                            <p style="color: #666; font-size: 14px;">
                                Se não abriu automaticamente:
                            </p>
                            <a href="\${appUrl}" target="_blank" class="btn">
                                🔗 Clique aqui
                            </a>
                        \`;
                    }, 1000);
                }
            } else {
                updateStatus('🌐 Acesso direto detectado');
                // Não está no iframe - redirecionar diretamente
                window.location.href = appUrl;
            }
        });
        
        // Listener para mensagens do parent (caso seja necessário)
        window.addEventListener('message', function(event) {
            console.log('Mensagem recebida do parent:', event.data);
        });
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).send(`<h1>Erro: ${error.message}</h1>`);
  }
};
