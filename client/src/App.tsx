import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

interface ERPConfig {
  configured: boolean;
  erp_url?: string;
  created_at?: string;
}

interface SyncOperation {
  id: number;
  operation_type: string;
  direction: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'config' | 'sync' | 'status'>('config');
  const [storeId, setStoreId] = useState<string>('');
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [erpConfig, setERPConfig] = useState<ERPConfig>({ configured: false });
  const [erpUrl, setERPUrl] = useState<string>('');
  const [erpToken, setERPToken] = useState<string>('');
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<SyncOperation[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const loadERPConfig = useCallback(async () => {
    try {
      console.log('🔄 Carregando config ERP...');
      const response = await axios.get(`/api/erp-config?store_id=${storeId}`);
      setERPConfig(response.data);
      if (response.data.configured && response.data.erp_url) {
        setERPUrl(response.data.erp_url);
      }
      console.log('✅ Config ERP carregada:', response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar config ERP:', error);
      showAlert('error', 'Erro ao carregar configuração ERP');
    }
  }, [storeId, showAlert]);

  const loadSyncHistory = useCallback(async () => {
    try {
      console.log('🔄 Carregando histórico...');
      const response = await axios.get(`/api/sync-products?store_id=${storeId}`);
      setSyncHistory(response.data.history || []);
      console.log('✅ Histórico carregado:', response.data.history);
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    }
  }, [storeId]);

  // Detectar store_id e inicializar app
  useEffect(() => {
    console.log('🚀 App iniciando...');
    
    // Detectar store_id da URL ou usar fallback
    const detectStoreId = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paramStoreId = urlParams.get('store_id');
      
      if (paramStoreId) {
        return paramStoreId;
      }
      
      // Tentar obter do path: /admin/123456/apps/19190
      const pathMatch = window.location.pathname.match(/\/admin\/(\d+)\/apps/);
      if (pathMatch) {
        return pathMatch[1];
      }
      
      // Fallback para desenvolvimento
      return '1234567';
    };
    
    const detectedStoreId = detectStoreId();
    setStoreId(detectedStoreId);
    setAppLoading(false);
    
    console.log('🏪 Store ID detectado:', detectedStoreId);
    
    // Notificar parent window que app está pronto (para iframe)
    try {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'APP_READY',
          appId: '19190',
          storeId: detectedStoreId
        }, '*');
        console.log('📢 Parent notificado que app está pronto');
      }
    } catch (e) {
      console.log('ℹ️ Rodando fora do iframe');
    }
  }, []);
  
  // Carregar configuração ERP quando store_id estiver disponível
  useEffect(() => {
    if (storeId) {
      loadERPConfig();
      loadSyncHistory();
    }
  }, [storeId, loadERPConfig, loadSyncHistory]);

  const saveERPConfig = async () => {
    if (!erpUrl.trim() || !erpToken.trim()) {
      showAlert('error', 'URL e Token do ERP são obrigatórios');
      return;
    }

    setConfigLoading(true);
    try {
      console.log('💾 Salvando config ERP...');
      const response = await axios.post('/api/erp-config', {
        store_id: storeId,
        erp_url: erpUrl.trim(),
        erp_token: erpToken.trim()
      });
      
      console.log('✅ Config salva:', response.data);
      showAlert('success', 'Configuração ERP salva com sucesso!');
      setERPToken('');
      await loadERPConfig();
      
    } catch (error) {
      console.error('❌ Erro ao salvar config ERP:', error);
      showAlert('error', 'Erro ao salvar configuração ERP');
    } finally {
      setConfigLoading(false);
    }
  };

  const syncProducts = async () => {
    if (!erpConfig.configured) {
      showAlert('error', 'Configure o ERP primeiro');
      setCurrentView('config');
      return;
    }

    setSyncLoading(true);
    try {
      console.log('🔄 Iniciando sincronização...');
      const response = await axios.post('/api/sync-products', {
        store_id: storeId,
        direction: 'erp_to_nuvemshop'
      });
      
      console.log('✅ Sincronização iniciada:', response.data);
      showAlert('success', 'Sincronização iniciada com sucesso!');
      await loadSyncHistory();
      setCurrentView('status');
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      showAlert('error', 'Erro ao iniciar sincronização');
    } finally {
      setSyncLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Loading inicial
  if (appLoading || !storeId) {
    return (
      <div className="app loading">
        <div className="loading-content">
          <h2>🔄 Carregando...</h2>
          <p>Inicializando LatAm Treasure Bridge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🏆 LatAm Treasure Bridge</h1>
        <p>Integração Nuvemshop x ERP - Loja #{storeId}</p>
      </div>

      <div className="nav">
        <button
          className={currentView === 'config' ? 'active' : ''}
          onClick={() => setCurrentView('config')}
        >
          ⚙️ Configuração
        </button>
        <button
          className={currentView === 'sync' ? 'active' : ''}
          onClick={() => setCurrentView('sync')}
        >
          🔄 Sincronização
        </button>
        <button
          className={currentView === 'status' ? 'active' : ''}
          onClick={() => setCurrentView('status')}
        >
          📊 Status
        </button>
      </div>

      {alert && (
        <div className={`alert ${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="content">
        {currentView === 'config' && (
          <div className="card">
            <h2>🔗 Configurar ERP</h2>
            
            {erpConfig.configured && (
              <div className="alert success">
                ERP configurado em {erpConfig.created_at ? formatDate(erpConfig.created_at) : 'data desconhecida'}
              </div>
            )}
            
            <div className="form-group">
              <label>URL do ERP</label>
              <input
                type="text"
                value={erpUrl}
                onChange={(e) => setERPUrl(e.target.value)}
                placeholder="http://localhost:8001"
                disabled={configLoading}
              />
            </div>
            
            <div className="form-group">
              <label>Token de Acesso</label>
              <input
                type="password"
                value={erpToken}
                onChange={(e) => setERPToken(e.target.value)}
                placeholder="Token do ERP"
                disabled={configLoading}
              />
            </div>
            
            <div className="buttons">
              <button
                onClick={saveERPConfig}
                disabled={!erpUrl.trim() || !erpToken.trim() || configLoading}
                className="btn primary"
              >
                {configLoading ? '⏳ Salvando...' : '💾 Salvar'}
              </button>
              
              {erpConfig.configured && (
                <button
                  onClick={() => showAlert('success', 'Teste simulado com sucesso!')}
                  disabled={configLoading}
                  className="btn secondary"
                >
                  🔄 Testar
                </button>
              )}
            </div>
          </div>
        )}

        {currentView === 'sync' && (
          <div className="card">
            <h2>🔄 Sincronizar Produtos</h2>
            
            {!erpConfig.configured ? (
              <div className="alert warning">
                Configure o ERP primeiro para poder sincronizar
              </div>
            ) : (
              <>
                <div className="info-box">
                  <p><strong>ERP:</strong> {erpConfig.erp_url}</p>
                  <p><strong>Nuvemshop:</strong> Loja #{storeId}</p>
                </div>
                
                <p>Esta operação copiará produtos do ERP para a Nuvemshop.</p>
                
                <button
                  onClick={syncProducts}
                  disabled={syncLoading}
                  className="btn primary large"
                >
                  {syncLoading ? '⏳ Sincronizando...' : '📦 Copiar Produtos do ERP'}
                </button>
              </>
            )}
          </div>
        )}

        {currentView === 'status' && (
          <div className="card">
            <h2>📊 Status das Sincronizações</h2>
            
            {syncHistory.length === 0 ? (
              <div className="alert info">
                Nenhuma sincronização realizada ainda
              </div>
            ) : (
              <div className="history">
                {syncHistory.map((operation) => (
                  <div key={operation.id} className="history-item">
                    <div className="history-header">
                      <span>{operation.operation_type}</span>
                      <span className={`status ${operation.status}`}>{operation.status}</span>
                    </div>
                    <p>Iniciado: {formatDate(operation.started_at)}</p>
                    
                    {operation.completed_at && (
                      <p>Concluído: {formatDate(operation.completed_at)}</p>
                    )}
                    
                    {operation.error_message && (
                      <p className="error">Erro: {operation.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <button onClick={loadSyncHistory} className="btn secondary">
              🔄 Atualizar Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
