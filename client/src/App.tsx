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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [erpConfig, setERPConfig] = useState<ERPConfig>({ configured: false });
  const [erpUrl, setERPUrl] = useState<string>('');
  const [erpToken, setERPToken] = useState<string>('');
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<SyncOperation[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const showAlert = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  // Verificar autenticação OAuth
  useEffect(() => {
    console.log('🚀 LatAm Treasure Bridge - Standalone App');
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const storeParam = urlParams.get('store_id');
    const storedStoreId = localStorage.getItem('nuvemshop_store_id');
    const storedToken = localStorage.getItem('nuvemshop_access_token');
    
    if (code && storeParam) {
      // Callback OAuth - processar código
      console.log('🔐 Processando OAuth callback...');
      processOAuthCallback(code, storeParam);
    } else if (storedStoreId && storedToken) {
      // Já autenticado
      console.log('✅ Já autenticado para loja:', storedStoreId);
      setStoreId(storedStoreId);
      setIsAuthenticated(true);
      setAppLoading(false);
    } else {
      // Não autenticado
      console.log('❌ Não autenticado - mostrar tela de instalação');
      setAppLoading(false);
    }
  }, []);

  const processOAuthCallback = async (code: string, store_id: string) => {
    try {
      console.log('🔄 Fazendo troca code → access_token...');
      
      const response = await fetch(`/api/callback?code=${code}&store_id=${store_id}`);
      
      if (response.ok) {
        // Salvar dados de autenticação
        localStorage.setItem('nuvemshop_store_id', store_id);
        localStorage.setItem('nuvemshop_authenticated', 'true');
        
        setStoreId(store_id);
        setIsAuthenticated(true);
        setAppLoading(false);
        
        showAlert('success', '🎉 App instalado com sucesso!');
        
        // Limpar URL
        window.history.replaceState({}, document.title, '/');
      } else {
        throw new Error('Erro na autenticação');
      }
    } catch (error) {
      console.error('❌ Erro OAuth:', error);
      showAlert('error', 'Erro na instalação. Tente novamente.');
      setAppLoading(false);
    }
  };

  const loadERPConfig = useCallback(async () => {
    if (!storeId) return;
    
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
    if (!storeId) return;
    
    try {
      console.log('🔄 Carregando histórico...');
      const response = await axios.get(`/api/sync-products?store_id=${storeId}`);
      setSyncHistory(response.data.history || []);
      console.log('✅ Histórico carregado:', response.data.history);
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    }
  }, [storeId]);

  // Carregar dados quando autenticado
  useEffect(() => {
    if (isAuthenticated && storeId) {
      loadERPConfig();
      loadSyncHistory();
    }
  }, [isAuthenticated, storeId, loadERPConfig, loadSyncHistory]);

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

  const handleInstall = () => {
    const appId = '19190';
    const installUrl = `https://www.nuvemshop.com.br/apps/${appId}/authorize`;
    window.location.href = installUrl;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Loading inicial
  if (appLoading) {
    return (
      <div className="app loading">
        <div className="loading-content">
          <h2>🔄 Carregando...</h2>
          <p>Inicializando LatAm Treasure Bridge...</p>
        </div>
      </div>
    );
  }

  // Tela de instalação (não autenticado)
  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="install-screen">
          <div className="install-content">
            <h1>🏆 LatAm Treasure Bridge</h1>
            <h2>Integração Nuvemshop x ERP</h2>
            
            <div className="install-info">
              <p>✅ Sincronize produtos do seu ERP com a Nuvemshop</p>
              <p>✅ Gerencie estoque automaticamente</p>
              <p>✅ Interface simples e intuitiva</p>
            </div>
            
            <button onClick={handleInstall} className="btn primary large install-btn">
              🚀 Instalar Aplicativo
            </button>
            
            <p className="install-note">
              Você será redirecionado para autorizar o aplicativo na sua loja Nuvemshop
            </p>
          </div>
        </div>
      </div>
    );
  }

  // App principal (autenticado)
  return (
    <div className="app">
      <div className="header">
        <h1>🏆 LatAm Treasure Bridge</h1>
        <p>Integração Nuvemshop x ERP - Loja #{storeId}</p>
        <small style={{color: 'green'}}>✅ App Standalone Conectado</small>
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
