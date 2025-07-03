# 🚀 LatAm Treasure - Callback Handler Nuvemshop

Projeto específico para gerenciar callbacks OAuth do aplicativo Nuvemshop da LatAm Treasure.

## 📁 Estrutura do Projeto

```
Projetosopracallback/
├── api/
│   ├── callback.js      # Handler principal do callback OAuth
│   └── test.js          # Endpoint de teste
├── package.json         # Dependências e scripts
├── vercel.json         # Configuração do Vercel
└── README.md           # Este arquivo
```

## 🔧 Configuração

### Credenciais do Aplicativo Nuvemshop:
- **App ID**: 19190
- **Client Secret**: a2fd713e74bf1d526c7e0514774cbee5f390a8302c9195b0

### URLs de Produção:
- **Site do App**: https://latamtreasure.com
- **Callback URL**: https://app.latamtreasure.com/api/callback
- **Teste**: https://app.latamtreasure.com/api/test

## 📝 Endpoints Disponíveis

### `GET /api/test`
Endpoint de teste para verificar se a API está funcionando.

**Resposta:**
```json
{
  "status": "ok",
  "message": "API funcionando perfeitamente! 🚀",
  "timestamp": "2025-01-03T...",
  "project": "LatAm Treasure Callback Handler"
}
```

### `GET /api/callback?code=...`
Handler principal do callback OAuth da Nuvemshop.

**Parâmetros:**
- `code` (query): Código de autorização temporário da Nuvemshop

**Fluxo:**
1. Recebe código de autorização
2. Troca código por access_token via API Nuvemshop
3. Salva dados da instalação
4. Exibe página de sucesso

## 🚀 Deploy no Vercel

1. Conectar repositório GitHub ao Vercel
2. Configurar domínio personalizado: `app.latamtreasure.com`
3. Deploy automático a cada push

## 🔍 Debug e Logs

Todos os logs importantes são exibidos no console do Vercel:
- ✅ Sucesso na instalação
- ❌ Erros detalhados
- 📝 Dados da requisição

## 🛡️ Segurança

- Validação de parâmetros de entrada
- Headers CORS configurados
- Tratamento de erros abrangente
- Logs detalhados para auditoria

## 📞 Suporte

Para dúvidas ou problemas:
- **Email**: suporte@latamtreasure.com
- **GitHub**: https://github.com/elienaibh/Projetosopracallback

---

**Projeto criado em**: Janeiro 2025  
**Versão**: 1.0.0  
**Autor**: LatAm Treasure Team
