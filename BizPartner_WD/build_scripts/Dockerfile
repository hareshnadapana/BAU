FROM nginx:1.15
COPY ../dist/celcom-wolverine /usr/share/nginx/html
COPY ../nginx-custom.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN chmod 755 -R /usr/share/nginx/html
