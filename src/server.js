require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Carrega variáveis de ambiente do arquivo .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const path = require('path');
const { Schema } = mongoose;
const morgan = require('morgan');
const responseTime = require('response-time');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3003; // Usando a porta 3003



console.log('RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY);
console.log('MONGO_URI:', process.env.MONGO_URI);

// Configurar Prometheus para coletar métricas
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em milissegundos',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 400, 500, 750, 1000, 2000, 5000]
});

// Middleware para medir o tempo de resposta das requisições
app.use(responseTime((req, res, time) => {
  if (req.route) {
    httpRequestDurationMicroseconds.labels(req.method, req.route.path, res.statusCode).observe(time);
  }
}));

// Rota para expor métricas para o Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Middleware de segurança e configuração do CORS
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3003',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Habilitar CORS para todas as origens (ou restrinja conforme necessário)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logs e tempo de resposta
app.use(morgan('combined')); // Logs HTTP
app.use(responseTime((req, res, time) => {
  console.log(`Tempo de resposta para [${req.method}] ${req.url}: ${time}ms`);
}));

// Middleware para limitar a taxa de requisições
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 1000,
});
app.use(limiter);

// Definir o schema do MongoDB para votos
const voteSchema = new Schema({
  candidato: { type: String, required: true },
  dataHora: { type: Date, default: Date.now }
});
const VoteModel = mongoose.model('Vote', voteSchema);

// Função para calcular o panorama dos votos
async function calcularPanorama() {
  const totalVotos = await VoteModel.countDocuments();
  const votosBeatriz = await VoteModel.countDocuments({ candidato: 'Beatriz' });
  const votosJuliette = await VoteModel.countDocuments({ candidato: 'Juliette' });

  const percentBeatriz = (votosBeatriz / totalVotos) * 100;
  const percentJuliette = (votosJuliette / totalVotos) * 100;

  return {
    totalVotos,
    percentBeatriz,
    percentJuliette
  };
}

// Função para calcular votos por hora
async function calcularVotosPorHora() {
  const votos = await VoteModel.aggregate([
    {
      $group: {
        _id: {
          ano: { $year: "$dataHora" },
          mes: { $month: "$dataHora" },
          dia: { $dayOfMonth: "$dataHora" },
          hora: { $hour: "$dataHora" }
        },
        totalVotos: { $sum: 1 }
      }
    },
    {
      $match: { "_id.ano": { $ne: null }, "_id.mes": { $ne: null }, "_id.dia": { $ne: null }, "_id.hora": { $ne: null } }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);
  return votos;
}

// Função para verificar o reCAPTCHA
async function verificarRecaptcha(token) {
  try {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token
      }
    });
    console.log('Resposta completa do reCAPTCHA:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('Erro na verificação do reCAPTCHA:', error);
    return false;
  }
}

// Rota para votar
app.post('/api/votar', async (req, res, next) => {
  console.log('Requisição recebida em /api/votar');
  console.log('Corpo da requisição:', req.body);

  const { nomeCandidato, captchaToken } = req.body;
  const candidatosValidos = ['Beatriz', 'Juliette'];

  if (!nomeCandidato || !candidatosValidos.includes(nomeCandidato)) {
    console.error('Dados inválidos');
    return res.status(400).json({ success: false, message: 'Dados de entrada inválidos. Verifique os campos e tente novamente.' });
  }

  const captchaValido = await verificarRecaptcha(captchaToken);
  if (!captchaValido) {
    console.error('reCAPTCHA inválido');
    return res.status(400).json({ success: false, message: 'Falha na verificação do reCAPTCHA. Tente novamente.' });
  }

  try {
    console.log('Salvando voto...');
    const voto = new VoteModel({ candidato: nomeCandidato });
    await voto.save();
    console.log('Voto salvo com sucesso.');

    const panorama = await calcularPanorama();

    res.status(200).json({ success: true, message: 'Voto recebido com sucesso!', panorama });
  } catch (error) {
    console.error('Erro ao salvar voto:', error);
    next(error);
  }
});

// Rota para obter estatísticas
app.get('/api/estatisticas', async (req, res, next) => {
  console.log('Requisição recebida em /api/estatisticas');
  console.log('Headers:', req.headers);
  
  try {
    const totalVotos = await VoteModel.countDocuments();
    const votosBeatriz = await VoteModel.countDocuments({ candidato: 'Beatriz' });
    const votosJuliette = await VoteModel.countDocuments({ candidato: 'Juliette' });
    const votosPorHora = await calcularVotosPorHora();

    const panorama = {
      totalVotos,
      votosPorParticipante: {
        Beatriz: votosBeatriz,
        Juliette: votosJuliette
      },
      votosPorHora
    };

    res.status(200).json({ success: true, panorama });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    next(error);
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  let status = 500;
  let message = 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Dados de entrada inválidos. Verifique os campos e tente novamente.';
  }
  res.status(status).json({ success: false, message });
});

// Capturar exceções não tratadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Enviar log para sistema de monitoramento ou executar ação apropriada
});

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexão bem-sucedida com o MongoDB.'))
  .catch(err => console.error('Erro de conexão com o MongoDB:', err));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
