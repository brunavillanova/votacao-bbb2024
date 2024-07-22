
## Métricas

### 1. Duração Média das Requisições HTTP para a Rota `/api/votar`

- **Métrica**: `rate(http_request_duration_ms_sum{route="/api/votar"}[15m]) / clamp_min(rate(http_request_duration_ms_count{route="/api/votar"}[15m]), 1)`
- **Descrição**: Calcula a duração média das requisições HTTP para a rota `/api/votar` nos últimos 15 minutos.

### 2. Taxa da Soma das Durações das Requisições HTTP

- **Métrica**: `rate(http_request_duration_ms_sum{route="/api/votar"}[10m])`
- **Descrição**: Calcula a taxa de crescimento por segundo da soma das durações das requisições HTTP para a rota `/api/votar` nos últimos 10 minutos.

### 3. Taxa da Contagem das Requisições HTTP

- **Métrica**: `rate(http_request_duration_ms_count{route="/api/votar"}[10m])`
- **Descrição**: Calcula a taxa de crescimento por segundo da contagem das requisições HTTP para a rota `/api/votar` nos últimos 10 minutos.



Uso:
    Estas métricas podem ser adicionadas ao seu sistema de monitoramento (por exemplo,Prometheus ou Grafana) para visualizar e analisar o desempenho das requisições HTTP na rota /api/votar. Elas são úteis para identificar problemas de desempenho, monitorar o tempo de resposta do servidor e analisar a carga de tráfego.