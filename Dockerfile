FROM --platform=linux/amd64 node:16.17.0 as builder

COPY . .

RUN npm install
RUN npm run build


FROM --platform=linux/amd64 nginx:1.23.2-alpine

USER root
COPY deploy/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder ./dist /app

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

