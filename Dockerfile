# ---- 1단계: 빌드 ----
# Node.js로 Vue.js 정적 파일을 빌드해요.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# ---- 2단계: 실행 ----
# 빌드된 정적 파일을 Nginx로 서빙해요.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]