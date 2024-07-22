DOCUMENTAÇÃO DO PROJETO DE VOTAÇÃO
Índice:

    1. Documentação do Projeto
    2. Documentação das APIs
    3. Documentação de Arquitetura
    4. Como Subir uma Cópia do Ambiente Localmente
    5. Autor

Documentação do Projeto

* Introdução:
Este projeto é um sistema de votação para o Big Brother Brasil (BBB 24), onde os usuários podem votar nos candidatos Beatriz ou Juliette. O sistema utiliza o reCAPTCHA do Google para prevenir votos automáticos e Prometheus para monitoramento de métricas.
Tecnologias Utilizadas:
Backend:

    Node.js
    Express
    MongoDB
    Mongoose
    Axios
    Helmet
    CORS
    Rate Limit
    Morgan
    Prometheus Client

Frontend:

    React
    Axios
    reCAPTCHA

Monitoramento:

    Prometheus

Estrutura do Projeto



BBB24/
├── node_modules/
├── public/
│   ├── bbb24.png
│   ├── beatriz.jpg
│   ├── index.html
│   ├── juliette.jpg
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   ├── index.js
│   └── server.js
├── .env
├── .gitignore
├── metrics.md
├── package-lock.json
├── package.json
├── prometheus.yml
└── README.md

Documentação das APIs

A documentação das APIs também está disponível em:
 [Postman Documentation](https://documenter.getpostman.com/view/32281538/2sA3kSnNty)

Rota para Votar:

    Endpoint: /api/votar
    Método: POST
    Descrição: Registra um voto para um candidato.
    Corpo da Requisição:

{
  "nomeCandidato": "Beatriz",
  "captchaToken": "TOKEN_DO_RECAPTCHA"
}

    Resposta de Sucesso:

{
  "success": true,
  "message": "Voto recebido com sucesso!",
  "panorama": {
    "totalVotos": 100,
    "percentBeatriz": 60.00,
    "percentJuliette": 40.00
  }
}

    Resposta de Erro:


{
  "success": false,
  "message": "Falha na verificação do reCAPTCHA. Tente novamente."
}

Rota para Estatísticas de Votos:

    Endpoint: /api/estatisticas
    Método: GET
    Descrição: Obtém as estatísticas de votos.
    Resposta de Sucesso:


{
  "success": true,
  "panorama": {
    "totalVotos": 100,
    "votosPorParticipante": {
      "Beatriz": 60,
      "Juliette": 40
    },
    "votosPorHora": [...]
  }
}

    Resposta de Erro:


{
  "success": false,
  "message": "Erro ao obter estatísticas. Tente novamente."
}

Rota para Métricas:

    Endpoint: /metrics
    Método: GET
    Descrição: Exibe as métricas do Prometheus.

Documentação de Arquitetura

* Arquitetura do Sistema:
O sistema de votação consiste em um frontend React que interage com um backend Node.js e Express. O backend se comunica com um banco de dados MongoDB para armazenar votos e utiliza o Prometheus para monitoramento de métricas.
Componentes Principais
Frontend:

    Desenvolvido em React.
    Utiliza Axios para fazer chamadas HTTP ao backend.
    Integração com Google reCAPTCHA para validação de votos.

Backend:

    Desenvolvido em Node.js com Express.
    Conexão com MongoDB utilizando Mongoose.
    Implementa rotas para registrar votos e obter estatísticas.
    Middleware de segurança e monitoramento (Helmet, CORS, Rate Limit, Morgan).
    Exposição de métricas para Prometheus.

Monitoramento:

    Configuração do Prometheus para coletar métricas de performance do backend.
    Métricas expostas na rota /metrics.

Diagrama de Arquitetura:



+------------+      +-------------+       +---------------+       +------------+
|  Frontend  | ---> |  Backend    | --->  |  MongoDB      |       | Prometheus |
|  (React)   |      |  (Express)  |       |  (Database)   |       |(Monitoring)|
+------------+      +-------------+       +---------------+       +------------+
    |                    |                         |
    |                    |                         |
    |                    +-------------------------+
    |                              |
    |                              v
    +-----------------> reCAPTCHA Validation



Como Subir uma Cópia do Ambiente Localmente
Pré-requisitos

    Node.js e npm
    MongoDB
    Prometheus

Passos para Configurar e Executar o Projeto

    Clone o repositório:

bash

git clone <url-do-repositorio>
cd <nome-do-repositorio>

    Configuração do Backend:

    Crie um arquivo .env no diretório raiz com as seguintes variáveis:

    plaintext

    REACT_APP_API_URL=http://localhost:3003
    REACT_APP_RECAPTCHA_SITE_KEY=6LdnzwYqAAAAAD4LXiEamxfPLMk8g9Z10UcDWzea
    RECAPTCHA_SECRET_KEY=6LdnzwYqAAAAADWC_TNpVOrJHeb8PoOuuzYygIDN
    PORT=3003
    MONGO_URI=mongodb://localhost:27017/site

    Instale as dependências do backend:


npm install

    Configuração do Frontend:

    Navegue até o diretório client e crie um arquivo .env com as mesmas variáveis do backend. Instale as dependências do frontend:



cd client
npm install

    Configuração do Prometheus:

    Crie um arquivo prometheus.yml com a seguinte configuração:



global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "node_app"
    static_configs:
      - targets: ["localhost:3003"]
    metrics_path: "/metrics"

    Inicie o Prometheus:



prometheus --config.file=prometheus.yml

    Inicie o Backend:




npm start

    Inicie o Frontend:


cd client
npm start

    Acesse a Aplicação:

    Frontend: http://localhost:3003
    Backend: http://localhost:3003
    Prometheus: http://localhost:9090 e http://localhost:9090/metrics 


Autor:

Este projeto foi desenvolvido por Bruna Villanova da Silva.