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


// @babel/preset-env:

//Esse preset permite que você use as funcionalidades mais recentes do JavaScript sem se preocupar 
//com a compatibilidade com versões antigas dos navegadores. 
//Ele faz isso convertendo o código moderno em uma versão que funciona em navegadores mais antigos 
//com base no ambiente de destino que você especificar.



// @babel/preset-react:

// Esse preset é usado para transformar o código JSX (JavaScript XML) em JavaScript padrão que os navegadores podem entender. 
// JSX é uma sintaxe usada pelo React para descrever a interface do usuário.