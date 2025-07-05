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

  // Verificar estado da instalação/autenticação
  useEffect(() => {
    console.log('🚀 LatAm Treasure Bridge - Inicializando...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const installedParam = urlParams.get('installed');
    const storeParam = urlParams.get('store_id');
    const codeParam = urlParams.get('code');
    
    // Dados salvos localmente
    const storedStoreId = localStorage.getItem('nuvemshop_store_id');
    const storedAuth = localStorage.getItem('nuvemshop_authenticated');
    
    console.log('📋 Parâmetros detectados:', {
      installed: installedParam,
      store_id: storeParam,
      code: codeParam,
      stored_store: storedStoreId,
      stored_auth: storedAuth
    });
    
    if (installedParam === 'true' && storeParam) {
      // Acabou de ser instalado via callback
      console.log('✅ Instalação detectada para loja:', storeParam);
      
      localStorage.setItem('nuvemshop_store_id', storeParam);
      localStorage.setItem('nuvemshop_authenticated', 'true');
      localStorage.setItem('nuvemshop_install_date', new Date().toISOString());
      
      setStoreId(storeParam);
      setIsAuthenticated(true);
      setAppLoading(false);
      
      showAlert('success', '🎉 Aplicativo instalado e conectado com sucesso!');
      
      // Limpar URL
      window.history.replaceState({}, document.title, '/app');
      
    } else if (codeParam) {
      // OAuth em andamento - deve ter sido redirecionado para /callback
      console.log('🔄 Código OAuth detectado, mas deveria estar no callback...');
      showAlert('info', 'Redirecionando para completar instalação...');
      window.location.href = `/api/callback${window.location.search}`;
      
    } else if (storedStoreId && storedAuth === 'true') {
      // Já autenticado anteriormente
      console.log('✅ Sessão existente para loja:', storedStoreId);
      setStoreId(storedStoreId);
      setIsAuthenticated(true);
      setAppLoading(false);
      
    } else {
      // Primeira visita - mostrar tela de instalação
      console.log('❌ Não autenticado - primeira visita');
      setAppLoading(false);
    }
  }, [showAlert]);

  const loadERPConfig = useCallback(async () => {
    if (!storeId) return;
    
    try {
      console.log('🔄 Carregando configuração ERP...');
      const response = await axios.get(`/api/erp-config?store_id=${storeId}`);
      setERPConfig(response.data);
      if (response.data.configured && response.data.erp_url) {
        setERPUrl(response.data.erp_url);
      }
      console.log('✅ Configuração ERP carregada:', response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar configuração ERP:', error);
      showAlert('error', 'Erro ao carregar configuração ERP');
    }
  }, [storeId, showAlert]);

  const loadSyncHistory = useCallback(async () => {
    if (!storeId) return;
    
    try {
      console.log('🔄 Carregando histórico de sincronização...');
      const response = await axios.get(`/api/sync-products?store_id=${storeId}`);
      setSyncHistory(response.data.history || []);
      console.log('✅ Histórico carregado:', response.data.history?.length || 0, 'itens');
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

    // Validação básica da URL
    try {
      new URL(erpUrl.trim());
    } catch {
      showAlert('error', 'URL do ERP inválida. Use formato: http://exemplo.com');
      return;
    }

    setConfigLoading(true);
    try {
      console.log('💾 Salvando configuração ERP...');
      const response = await axios.post('/api/erp-config', {
        store_id: storeId,
        erp_url: erpUrl.trim(),
        erp_token: erpToken.trim()
      });
      
      console.log('✅ Configuração salva:', response.data);
      showAlert('success', 'Configuração ERP salva com sucesso!');
      setERPToken(''); // Limpar token por segurança
      await loadERPConfig();
      
    } catch (error) {
      console.error('❌ Erro ao salvar configuração ERP:', error);
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
      console.log('🔄 Iniciando sincronização de produtos...');
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
    const APP_ID = '19190';
    const installUrl = `https://www.nuvemshop.com.br/apps/${APP_ID}/authorize`;
    
    console.log('🔗 Redirecionando para instalação:', installUrl);
    showAlert('info', 'Redirecionando para autorização...');
    
    // Delay pequeno para mostrar o alerta
    setTimeout(() => {
      window.location.href = installUrl;
    }, 500);
  };

  const handleReinstall = () => {
    localStorage.clear();
    showAlert('info', 'Dados limpos. Redirecionando para reinstalação...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Loading inicial
  if (appLoading) {
    return (
      <div className="app loading">
        <div className="loading-content">
          <h2>🔄 Carregando...</h2>
          <p>Inicializando LatAm Treasure Bridge...</p>
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
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
            <h2>Integração Nuvemshop × ERP</h2>
            
            <div className="install-info">
              <div className="feature">
                <span className="icon">✅</span>
                <span>Sincronize produtos do seu ERP com a Nuvemshop</span>
              </div>
              <div className="feature">
                <span className="icon">✅</span>
                <span>Gerencie estoque automaticamente</span>
              </div>
              <div className="feature">
                <span className="icon">✅</span>
                <span>Interface simples e intuitiva</span>
              </div>
              <div className="feature">
                <span className="icon">✅</span>
                <span>Aplicativo standalone seguro</span>
              </div>
            </div>
            
            <button onClick={handleInstall} className="btn primary large install-btn">
              🚀 Instalar Aplicativo
            </button>
            
            <p className="install-note">
              Você será redirecionado para autorizar o aplicativo na sua loja Nuvemshop
            </p>
            
            <div className="debug-info">
              <details>
                <summary>🔧 Informações de Debug</summary>
                <p>URL atual: {window.location.href}</p>
                <p>Parâmetros: {window.location.search}</p>
                <p>Timestamp: {new Date().toISOString()}</p>
              </details>
            </div>
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
        <p>Integração Nuvemshop × ERP - Loja #{storeId}</p>
        <div className="status-badges">
          <span className="badge success">✅ Conectado</span>
          <span className="badge info">🔗 Standalone</span>
          {erpConfig.configured && <span className="badge success">⚙️ ERP OK</span>}
        </div>
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
              <label>URL do ERP *</label>
              <input
                type="text"
                value={erpUrl}
                onChange={(e) => setERPUrl(e.target.value)}
                placeholder="https://meu-erp.com ou http://localhost:8001"
                disabled={configLoading}
              />
              <small>Inclua http:// ou https://</small>
            </div>
            
            <div className="form-group">
              <label>Token de Acesso *</label>
              <input
                type="password"
                value={erpToken}
                onChange={(e) => setERPToken(e.target.value)}
                placeholder="Token de autenticação do ERP"
                disabled={configLoading}
              />
              <small>Token fornecido pelo seu sistema ERP</small>
            </div>
            
            <div className="buttons">
              <button
                onClick={saveERPConfig}
                disabled={!erpUrl.trim() || !erpToken.trim() || configLoading}
                className="btn primary"
              >
                {configLoading ? '⏳ Salvando...' : '💾 Salvar Configuração'}
              </button>
              
              {erpConfig.configured && (
                <button
                  onClick={() => showAlert('success', '🧪 Teste de conexão simulado com sucesso!')}
                  disabled={configLoading}
                  className="btn secondary"
                >
                  🧪 Testar Conexão
                </button>
              )}
              
              <button
                onClick={handleReinstall}
                className="btn danger small"
              >
                🔄 Reinstalar App
              </button>
            </div>
          </div>
        )}

        {currentView === 'sync' && (
          <div className="card">
            <h2>🔄 Sincronizar Produtos</h2>
            
            {!erpConfig.configured ? (
              <div className="alert warning">
                <strong>⚠️ ERP não configurado</strong><br />
                Configure a conexão com o ERP primeiro para poder sincronizar produtos.
              </div>
            ) : (
              <>
                <div className="info-box">
                  <h3>📋 Configuração Atual</h3>
                  <p><strong>ERP:</strong> {erpConfig.erp_url}</p>
                  <p><strong>Nuvemshop:</strong> Loja #{storeId}</p>
                  <p><strong>Direção:</strong> ERP → Nuvemshop</p>
                </div>
                
                <div className="sync-description">
                  <h3>📦 Como funciona a sincronização:</h3>
                  <ul>
                    <li>Busca produtos no seu sistema ERP</li>
                    <li>Cria/atualiza produtos na Nuvemshop</li>
                    <li>Sincroniza preços, estoques e descrições</li>
                    <li>Mantém histórico de todas as operações</li>
                  </ul>
                </div>
                
                <button
                  onClick={syncProducts}
                  disabled={syncLoading}
                  className="btn primary large"
                >
                  {syncLoading ? '⏳ Sincronizando...' : '📦 Iniciar Sincronização'}
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
                <strong>📋 Nenhuma sincronização realizada</strong><br />
                Use a aba "Sincronização" para executar sua primeira sincronização de produtos.
              </div>
            ) : (
              <div className="history">
                <h3>📝 Histórico ({syncHistory.length} operações)</h3>
                {syncHistory.map((operation) => (
                  <div key={operation.id} className="history-item">
                    <div className="history-header">
                      <span className="operation-type">{operation.operation_type}</span>
                      <span className={`status ${operation.status}`}>
                        {operation.status === 'completed' && '✅'}
                        {operation.status === 'pending' && '⏳'}
                        {operation.status === 'failed' && '❌'}
                        {operation.status}
                      </span>
                    </div>
                    <p><strong>Iniciado:</strong> {formatDate(operation.started_at)}</p>
                    
                    {operation.completed_at && (
                      <p><strong>Concluído:</strong> {formatDate(operation.completed_at)}</p>
                    )}
                    
                    {operation.error_message && (
                      <p className="error"><strong>Erro:</strong> {operation.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="buttons">
              <button onClick={loadSyncHistory} className="btn secondary">
                🔄 Atualizar Status
              </button>
              
              {syncHistory.length > 0 && (
                <button 
                  onClick={() => showAlert('info', 'Funcionalidade de limpeza será implementada em breve')}
                  className="btn danger small"
                >
                  🗑️ Limpar Histórico
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="footer">
        <p>💎 LatAm Treasure Bridge v2.0 | Desenvolvido para Nuvemshop</p>
        <p>🕒 Última atualização: {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  );
}

export default App;
