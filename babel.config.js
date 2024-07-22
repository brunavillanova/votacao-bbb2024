// Exporta um objeto de configuração para o Babel
module.exports = {
  // Define os presets a serem usados pelo Babel
  presets: [
    // '@babel/preset-env' é um preset que permite usar as últimas funcionalidades do JavaScript
    // sem se preocupar com a compatibilidade com versões antigas dos navegadores
    '@babel/preset-env',
    
    // '@babel/preset-react' é um preset que permite transformar código JSX (usado em React)
    // em código JavaScript que os navegadores podem entender
    '@babel/preset-react'
  ]
};
