FROM nginx:1.16.0-alpine
COPY . /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY infra/nginx.conf /etc/nginx/conf.d
EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]
