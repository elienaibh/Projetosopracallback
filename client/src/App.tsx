import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Card, Button, Input, Alert } from '@nimbus-ds/components';
import '@nimbus-ds/styles/dist/index.css';
import axios from 'axios';

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

  useEffect(() => {
    console.log('🚀 App iniciando...');
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

  const testERPConnection = async () => {
    setConfigLoading(true);
    try {
      showAlert('success', 'Teste de conexão simulado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao testar ERP:', error);
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

  const renderConfigView = () => (
    <Card>
      <Card.Body>
        <Box>
          <Text>🔗 Configurar ERP</Text>
          
          {erpConfig.configured && (
            <Alert appearance="success">
              ERP configurado em {erpConfig.created_at ? formatDate(erpConfig.created_at) : 'data desconhecida'}
            </Alert>
          )}
          
          <Box>
            <Text>URL do ERP</Text>
            <Input
              value={erpUrl}
              onChange={(e) => setERPUrl(e.target.value)}
              placeholder="http://localhost:8001"
              disabled={configLoading}
            />
          </Box>
          
          <Box>
            <Text>Token de Acesso</Text>
            <Input
              type="password"
              value={erpToken}
              onChange={(e) => setERPToken(e.target.value)}
              placeholder="Token do ERP"
              disabled={configLoading}
            />
          </Box>
          
          <Box>
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
        <Box>
          <Text>🔄 Sincronizar Produtos</Text>
          
          {!erpConfig.configured ? (
            <Alert appearance="warning">
              Configure o ERP primeiro para poder sincronizar
            </Alert>
          ) : (
            <Box>
              <Box>
                <Text>ERP: {erpConfig.erp_url}</Text>
                <Text>Nuvemshop: Loja #{storeId}</Text>
              </Box>
              
              <Text>Esta operação copiará produtos do ERP para a Nuvemshop.</Text>
              
              <Button
                onClick={syncProducts}
                disabled={syncLoading}
              >
                {syncLoading ? '⏳ Sincronizando...' : '📦 Copiar Produtos do ERP'}
              </Button>
            </Box>
          )}
        </Box>
      </Card.Body>
    </Card>
  );

  const renderStatusView = () => (
    <Card>
      <Card.Body>
        <Box>
          <Text>📊 Status das Sincronizações</Text>
          
          {syncHistory.length === 0 ? (
            <Alert appearance="neutral">
              Nenhuma sincronização realizada ainda
            </Alert>
          ) : (
            <Box>
              {syncHistory.map((operation) => (
                <Box key={operation.id}>
                  <Text>{operation.operation_type} - {operation.status}</Text>
                  <Text>Iniciado: {formatDate(operation.started_at)}</Text>
                  
                  {operation.completed_at && (
                    <Text>Concluído: {formatDate(operation.completed_at)}</Text>
                  )}
                  
                  {operation.error_message && (
                    <Text>Erro: {operation.error_message}</Text>
                  )}
                </Box>
              ))}
            </Box>
          )}
          
          <Button onClick={loadSyncHistory}>
            🔄 Atualizar Status
          </Button>
        </Box>
      </Card.Body>
    </Card>
  );

  return (
    <Box>
      <Box>
        <Text>🏆 LatAm Treasure Bridge</Text>
        <Text>Integração Nuvemshop x ERP</Text>
        <Text>Store ID: {storeId}</Text>
      </Box>

      <Box>
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
        <Alert appearance={alert.type === 'success' ? 'success' : 'danger'}>
          {alert.message}
        </Alert>
      )}

      {currentView === 'config' && renderConfigView()}
      {currentView === 'sync' && renderSyncView()}
      {currentView === 'status' && renderStatusView()}
    </Box>
  );
}

export default App;
