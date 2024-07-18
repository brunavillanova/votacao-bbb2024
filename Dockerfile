# Use uma imagem base com Node.js
FROM node:14

# Crie um diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Construa o aplicativo
RUN npm run build

# Use uma imagem base com Nginx para servir a aplicação
FROM nginx:alpine
COPY --from=build-stage /app/build /usr/share/nginx/html

# Exponha a porta usada pelo Nginx
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
