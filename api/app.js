/**
 * Entry point que FORÇA abertura em nova aba
 * Detecta iframe e força redirect
 */

module.exports = async function handler(req, res) {
  try {
    console.log('🚀 App carregando...');
    
    // HTML que detecta iframe e força nova aba
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>LatAm Treasure Bridge</title>
    <meta charset="utf-8">
</head>
<body>
    <script>
        // Detectar se está no iframe
        if (window.parent !== window.self) {
            // Está no iframe - forçar nova aba
            console.log('🔄 Detectado iframe - abrindo em nova aba...');
            window.parent.open('https://app.latamtreasure.com/app', '_blank');
            
            // Mostrar mensagem no iframe
            document.body.innerHTML = \`
                <div style="
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    font-family: Arial, sans-serif;
                    text-align: center;
                    background: #f5f7fa;
                ">
                    <div style="
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                        max-width: 400px;
                    ">
                        <h2 style="color: #1a73e8; margin-bottom: 20px;">
                            🚀 LatAm Treasure Bridge
                        </h2>
                        <p style="color: #333; margin-bottom: 20px;">
                            ✅ Aplicativo aberto em nova aba!
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Se não abriu automaticamente: 
                            <a href="https://app.latamtreasure.com/app" target="_blank" style="color: #1a73e8;">
                                Clique aqui
                            </a>
                        </p>
                    </div>
                </div>
            \`;
        } else {
            // Não está no iframe - redirecionar para raiz
            console.log('🌐 Acesso direto - redirecionando...');
            window.location.href = 'https://app.latamtreasure.com/';
        }
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
