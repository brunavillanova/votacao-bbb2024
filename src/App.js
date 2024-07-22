import React, { useReducer } from 'react';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import './App.css';

// Estado inicial da aplicação
const initialState = {
  votoEnviado: false, // Indica se o voto foi enviado
  feedback: '', // Mensagem de feedback para o usuário
  panorama: null, // Panorama dos votos
  isLoading: false, // Indica se a aplicação está carregando
  captchaToken: '', // Token do reCAPTCHA
};

// Função redutora para atualizar o estado com base nas ações
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_VOTO_ENVIADO':
      return { ...state, votoEnviado: action.payload };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'SET_PANORAMA':
      return { ...state, panorama: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CAPTCHA_TOKEN':
      return { ...state, captchaToken: action.payload };
    default:
      return state;
  }
};

// Componente principal da aplicação
function App() {
  // Usa useReducer para gerenciar o estado da aplicação
  const [state, dispatch] = useReducer(reducer, initialState);

  // Função para enviar o voto
  const enviarVoto = async (nomeCandidato) => {
    // Verifica se o reCAPTCHA foi completado
    if (!state.captchaToken) {
      dispatch({ type: 'SET_FEEDBACK', payload: 'Por favor, complete o reCAPTCHA.' });
      return;
    }

    console.log('Enviando voto para:', nomeCandidato); // Log do frontend
    dispatch({ type: 'SET_FEEDBACK', payload: 'Enviando voto...' });
    dispatch({ type: 'SET_IS_LOADING', payload: true });

    try {
      // Envia o voto ao backend
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/votar`, {
        nomeCandidato,
        captchaToken: state.captchaToken,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Resposta do servidor:', response); // Log da resposta do servidor

      if (response.data.success) {
        dispatch({ type: 'SET_VOTO_ENVIADO', payload: true });
        dispatch({ type: 'SET_FEEDBACK', payload: `Voto para ${nomeCandidato} enviado com sucesso!` });
        dispatch({ type: 'SET_PANORAMA', payload: response.data.panorama });
      } else {
        dispatch({ type: 'SET_FEEDBACK', payload: response.data.message || 'Erro desconhecido ao enviar o voto.' });
      }
    } catch (error) {
      console.error('Erro ao enviar o voto:', error);
      dispatch({ type: 'SET_FEEDBACK', payload: `Erro ao enviar o voto: ${error.response ? error.response.data.message : error.message}` });
    }
    dispatch({ type: 'SET_IS_LOADING', payload: false });
  };

  // Função para resetar o estado após o envio do voto
  const resetarVoto = () => {
    dispatch({ type: 'SET_VOTO_ENVIADO', payload: false });
    dispatch({ type: 'SET_FEEDBACK', payload: '' });
    dispatch({ type: 'SET_PANORAMA', payload: null });
    dispatch({ type: 'SET_CAPTCHA_TOKEN', payload: '' });
  };

  // Função para lidar com mudanças no reCAPTCHA
  const onCaptchaChange = (token) => {
    console.log('Captcha token:', token);
    dispatch({ type: 'SET_CAPTCHA_TOKEN', payload: token });
    dispatch({ type: 'SET_FEEDBACK', payload: '' }); // Limpa o feedback de erro ao preencher o captcha
  };

  return (
    <div className="App">
      <header>
        <div className="container">
          <nav className="menu-logo">
            <div className="menu-icon">
              <div className="menu-line"></div>
              <div className="menu-line"></div>
              <div className="menu-line"></div>
            </div>
          </nav>
          <nav>
            <div className="search">
              <input type="text" placeholder="BUSCAR" aria-label="Buscar" />
              <button aria-label="Pesquisar">
                <svg width="15" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search">
                  <circle cx="10" cy="10" r="8"></circle>
                  <line x1="25" y1="25" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
            <div className="bbb-logo">
              <p>BBB 24</p>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <div className="container">
          {state.votoEnviado ? (
            <VotoEnviadoSection panorama={state.panorama} resetarVoto={resetarVoto} />
          ) : (
            <VotingSection
              enviarVoto={enviarVoto}
              isLoading={state.isLoading}
              feedback={state.feedback}
              onCaptchaChange={onCaptchaChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Seção exibida após o envio do voto
const VotoEnviadoSection = ({ panorama, resetarVoto }) => (
  <div>
    <h1>Obrigado por votar!</h1>
    <p>Seu voto foi registrado com sucesso.</p>
    {panorama && (
      <div>
        <h2>Panorama dos Votos</h2>
        <p>Total de Votos: {panorama.totalVotos}</p>
        <p>Beatriz: {panorama.percentBeatriz.toFixed(2)}%</p>
        <p>Juliette: {panorama.percentJuliette.toFixed(2)}%</p>
      </div>
    )}
    <div className="return-button">
      <button onClick={resetarVoto}>Voltar à página inicial</button>
    </div>
  </div>
);

// Seção de votação
const VotingSection = ({ enviarVoto, isLoading, feedback, onCaptchaChange }) => (
  <div>
    <h1>Voto Único: quem você quer que fique no BBB 24?</h1>
    <p>Vote para definir quem deve ficar no Big Brother Brasil 2024 no primeiro Paredão da temporada!</p>
    <div className="voting-options">
      <p>Vote quantas vezes quiser.</p>
      <VotingOption nome="Beatriz" enviarVoto={enviarVoto} isLoading={isLoading} />
      <VotingOption nome="Juliette" enviarVoto={enviarVoto} isLoading={isLoading} />
    </div>
    <ReCAPTCHA
      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
      onChange={onCaptchaChange}
    />
    {isLoading && <p className="feedback feedback-loading">Enviando voto...</p>}
    {feedback && !isLoading && <p className="feedback feedback-error">{feedback}</p>}
  </div>
);

// Componente de opção de votação
const VotingOption = ({ nome, enviarVoto, isLoading }) => (
  <div className="option" data-name={nome.toLowerCase()}>
    <img src={`${process.env.PUBLIC_URL}/${nome.toLowerCase()}.jpg`} alt={`Foto de ${nome}`} />
    <p>{nome}</p>
    <button onClick={() => enviarVoto(nome)} disabled={isLoading}>Votar</button>
  </div>
);

export default App;
