import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Tipos TypeScript
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
  // Estado da aplicação
  const [currentView, setCurrentView] = useState<'config' | 'sync' | 'status'>('config');
  const [storeId] = useState<string>('1234567'); // TODO: Obter do URL params
  
  // Estado da configuração ERP
  const [erpConfig, setERPConfig] = useState<ERPConfig>({ configured: false });
  const [erpUrl, setERPUrl] = useState<string>('');
  const [erpToken, setERPToken] = useState<string>('');
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  
  // Estado da sincronização
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<SyncOperation[]>([]);
  
  // Estado de alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // API Base URL - ajustado para produção
  const API_BASE = '/api';

  // Carregar configuração ERP ao iniciar
  useEffect(() => {
    loadERPConfig();
    loadSyncHistory();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadERPConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE}/erp/config/${storeId}`);
      setERPConfig(response.data);
      if (response.data.configured && response.data.erp_url) {
        setERPUrl(response.data.erp_url);
      }
    } catch (error) {
      console.error('Erro ao carregar config ERP:', error);
    }
  };

  const saveERPConfig = async () => {
    if (!erpUrl.trim() || !erpToken.trim()) {
      showAlert('error', 'URL e Token do ERP são obrigatórios');
      return;
    }

    setConfigLoading(true);
    try {
      await axios.post(`${API_BASE}/erp/config/${storeId}`, {
        erp_url: erpUrl.trim(),
        erp_token: erpToken.trim()
      });
      
      showAlert('success', 'Configuração ERP salva com sucesso!');
      setERPToken(''); // Limpar token por segurança
      await loadERPConfig();
      
    } catch (error) {
      console.error('Erro ao salvar config ERP:', error);
      showAlert('error', 'Erro ao salvar configuração ERP');
    } finally {
      setConfigLoading(false);
    }
  };

  const testERPConnection = async () => {
    setConfigLoading(true);
    try {
      await axios.post(`${API_BASE}/erp/test/${storeId}`);
      showAlert('success', 'Conexão com ERP testada com sucesso!');
    } catch (error) {
      console.error('Erro ao testar ERP:', error);
      showAlert('error', 'Erro ao testar conexão com ERP');
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
      await axios.post(`${API_BASE}/sync/products/${storeId}`, {
        direction: 'erp_to_nuvemshop'
      });
      
      showAlert('success', 'Sincronização iniciada com sucesso!');
      await loadSyncHistory();
      setCurrentView('status');
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      showAlert('error', 'Erro ao iniciar sincronização');
    } finally {
      setSyncLoading(false);
    }
  };

  const loadSyncHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sync/history/${storeId}`);
      setSyncHistory(response.data.history || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <h1>🏆 LatAm Treasure Bridge</h1>
        <p>Integração Nuvemshop x ERP</p>
      </div>

      {/* Navegação */}
      <div className="app-nav">
        <button 
          className={`nav-btn ${currentView === 'config' ? 'active' : ''}`}
          onClick={() => setCurrentView('config')}
        >
          ⚙️ Configuração
        </button>
        <button 
          className={`nav-btn ${currentView === 'sync' ? 'active' : ''}`}
          onClick={() => setCurrentView('sync')}
        >
          🔄 Sincronização
        </button>
        <button 
          className={`nav-btn ${currentView === 'status' ? 'active' : ''}`}
          onClick={() => setCurrentView('status')}
        >
          📊 Status
        </button>
      </div>

      {/* Alert Global */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      {/* Conteúdo das Telas */}
      <div className="app-content">
        {currentView === 'config' && (
          <div className="card">
            <h2>🔗 Configurar ERP</h2>
            
            {erpConfig.configured && (
              <div className="alert alert-success">
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
            
            <div className="btn-group">
              <button
                onClick={saveERPConfig}
                disabled={!erpUrl.trim() || !erpToken.trim() || configLoading}
                className="btn btn-primary"
              >
                {configLoading ? '⏳ Salvando...' : '💾 Salvar'}
              </button>
              
              {erpConfig.configured && (
                <button
                  onClick={testERPConnection}
                  disabled={configLoading}
                  className="btn btn-secondary"
                >
                  {configLoading ? '⏳ Testando...' : '🔄 Testar'}
                </button>
              )}
            </div>
          </div>
        )}

        {currentView === 'sync' && (
          <div className="card">
            <h2>🔄 Sincronizar Produtos</h2>
            
            {!erpConfig.configured ? (
              <div className="alert alert-warning">
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
                  className="btn btn-primary btn-large"
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
              <div className="alert alert-info">
                Nenhuma sincronização realizada ainda
              </div>
            ) : (
              <div className="sync-history">
                {syncHistory.map((operation) => (
                  <div key={operation.id} className="sync-item">
                    <div className="sync-header">
                      <span className="sync-type">{operation.operation_type}</span>
                      <span className={`sync-status status-${operation.status}`}>
                        {operation.status}
                      </span>
                    </div>
                    
                    <div className="sync-details">
                      <p><strong>Iniciado:</strong> {formatDate(operation.started_at)}</p>
                      
                      {operation.completed_at && (
                        <p><strong>Concluído:</strong> {formatDate(operation.completed_at)}</p>
                      )}
                      
                      {operation.error_message && (
                        <p className="error"><strong>Erro:</strong> {operation.error_message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={loadSyncHistory}
              className="btn btn-secondary"
            >
              🔄 Atualizar Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;