# Etapa 1: Construção do aplicativo
FROM node:14 AS build-stage

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

# Etapa 2: Servir a aplicação com Nginx
FROM nginx:alpine

# Copie os arquivos da etapa de construção
COPY --from=build-stage /app/build /usr/share/nginx/html

# Exponha a porta usada pelo Nginx
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
