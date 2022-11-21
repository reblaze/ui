FROM --platform=linux/amd64 node:16.17.0 as builder

COPY . .

RUN npm install
RUN npm run build


FROM --platform=linux/amd64 nginx:1.23.2-alpine

USER root
COPY deploy/nginx.conf /etc/nginx/nginx.conf

# RUN ln -sf /init/nginx.conf /etc/nginx/nginx.conf
# RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
#     ln -sf /dev/stderr /var/log/nginx/error.log && \
#         ln -sf /init/http.conf /etc/nginx/conf.d/ && \
#         ln -sf /init/tls-dockercompose.conf /etc/nginx/conf.d/ && \
#         ln -sf /init/tls-k8s.conf /etc/nginx/conf.d/
# RUN /usr/bin/apt-get update && \
#     /usr/bin/apt-get install -yq --no-install-recommends dumb-init && \
#         rm -rf /var/lib/apt/lists/*

COPY --from=builder ./dist /app

EXPOSE 80

ENTRYPOINT ["/usr/sbin/nginx", "-g", "'daemon off;'"]
