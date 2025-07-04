import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Card, Button, Input, Alert } from '@nimbus-ds/components';
import '@nimbus-ds/styles/dist/index.css';
import axios from 'axios';

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
  const [currentView, setCurrentView] = useState<'config' | 'sync' | 'status'>('config');
  const [storeId] = useState<string>('1234567');
  const [erpConfig, setERPConfig] = useState<ERPConfig>({ configured: false });
  const [erpUrl, setERPUrl] = useState<string>('');
  const [erpToken, setERPToken] = useState<string>('');
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<SyncOperation[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const API_BASE = '/api';

  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const loadERPConfig = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/erp/config/${storeId}`);
      setERPConfig(response.data);
      if (response.data.configured && response.data.erp_url) {
        setERPUrl(response.data.erp_url);
      }
    } catch (error) {
      console.error('Erro ao carregar config ERP:', error);
    }
  }, [API_BASE, storeId]);

  const loadSyncHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/sync/history/${storeId}`);
      setSyncHistory(response.data.history || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }, [API_BASE, storeId]);

  useEffect(() => {
    loadERPConfig();
    loadSyncHistory();
  }, [loadERPConfig, loadSyncHistory]);

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
      setERPToken('');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const renderConfigView = () => (
    <Card>
      <Card.Body>
        <Box display="flex" flexDirection="column" gap="base">
          <Text fontSize="base" fontWeight="bold">
            🔗 Configurar ERP
          </Text>
          
          {erpConfig.configured && (
            <Alert appearance="success">
              ERP configurado em {erpConfig.created_at ? formatDate(erpConfig.created_at) : 'data desconhecida'}
            </Alert>
          )}
          
          <Box display="flex" flexDirection="column" gap="small">
            <Text fontSize="small">URL do ERP</Text>
            <Input
              value={erpUrl}
              onChange={(e) => setERPUrl(e.target.value)}
              placeholder="http://localhost:8001"
              disabled={configLoading}
            />
          </Box>
          
          <Box display="flex" flexDirection="column" gap="small">
            <Text fontSize="small">Token de Acesso</Text>
            <Input
              type="password"
              value={erpToken}
              onChange={(e) => setERPToken(e.target.value)}
              placeholder="Token do ERP"
              disabled={configLoading}
            />
          </Box>
          
          <Box display="flex" gap="small">
            <Button
              onClick={saveERPConfig}
              disabled={!erpUrl.trim() || !erpToken.trim() || configLoading}
            >
              💾 Salvar
            </Button>
            
            {erpConfig.configured && (
              <Button
                appearance="neutral"
                onClick={testERPConnection}
                disabled={configLoading}
              >
                🔄 Testar
              </Button>
            )}
          </Box>
        </Box>
      </Card.Body>
    </Card>
  );

  const renderSyncView = () => (
    <Card>
      <Card.Body>
        <Box display="flex" flexDirection="column" gap="base">
          <Text fontSize="base" fontWeight="bold">
            🔄 Sincronizar Produtos
          </Text>
          
          {!erpConfig.configured ? (
            <Alert appearance="warning">
              Configure o ERP primeiro para poder sincronizar
            </Alert>
          ) : (
            <>
              <Box>
                <Text fontSize="small">
                  ERP: {erpConfig.erp_url}
                </Text>
                <Text fontSize="small">
                  Nuvemshop: Loja #{storeId}
                </Text>
              </Box>
              
              <Text fontSize="small">
                Esta operação copiará produtos do ERP para a Nuvemshop.
              </Text>
              
              <Button
                onClick={syncProducts}
                disabled={syncLoading}
              >
                {syncLoading ? '⏳ Sincronizando...' : '📦 Copiar Produtos do ERP'}
              </Button>
            </>
          )}
        </Box>
      </Card.Body>
    </Card>
  );

  const renderStatusView = () => (
    <Card>
      <Card.Body>
        <Box display="flex" flexDirection="column" gap="base">
          <Text fontSize="base" fontWeight="bold">
            📊 Status das Sincronizações
          </Text>
          
          {syncHistory.length === 0 ? (
            <Alert appearance="neutral">
              Nenhuma sincronização realizada ainda
            </Alert>
          ) : (
            <Box display="flex" flexDirection="column" gap="small">
              {syncHistory.map((operation) => (
                <Box key={operation.id}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Text fontSize="small" fontWeight="bold">
                      {operation.operation_type}
                    </Text>
                    <Text fontSize="small">
                      {operation.status}
                    </Text>
                  </Box>
                  
                  <Text fontSize="small">
                    Iniciado: {formatDate(operation.started_at)}
                  </Text>
                  
                  {operation.completed_at && (
                    <Text fontSize="small">
                      Concluído: {formatDate(operation.completed_at)}
                    </Text>
                  )}
                  
                  {operation.error_message && (
                    <Text fontSize="small">
                      Erro: {operation.error_message}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          )}
          
          <Button
            appearance="neutral"
            onClick={loadSyncHistory}
          >
            🔄 Atualizar Status
          </Button>
        </Box>
      </Card.Body>
    </Card>
  );

  return (
    <Box>
      <Box>
        <Text fontSize="base" fontWeight="bold">
          🏆 LatAm Treasure Bridge
        </Text>
        <Text fontSize="small">
          Integração Nuvemshop x ERP
        </Text>
      </Box>

      <Box display="flex" gap="small">
        <Button
          appearance={currentView === 'config' ? 'primary' : 'neutral'}
          onClick={() => setCurrentView('config')}
        >
          ⚙️ Configuração
        </Button>
        <Button
          appearance={currentView === 'sync' ? 'primary' : 'neutral'}
          onClick={() => setCurrentView('sync')}
        >
          🔄 Sincronização
        </Button>
        <Button
          appearance={currentView === 'status' ? 'primary' : 'neutral'}
          onClick={() => setCurrentView('status')}
        >
          📊 Status
        </Button>
      </Box>

      {alert && (
        <Box>
          <Alert appearance={alert.type === 'success' ? 'success' : 'danger'}>
            {alert.message}
          </Alert>
        </Box>
      )}

      {currentView === 'config' && renderConfigView()}
      {currentView === 'sync' && renderSyncView()}
      {currentView === 'status' && renderStatusView()}
    </Box>
  );
}

export default App;
