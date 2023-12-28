FROM nginx:latest
 
RUN rm /etc/nginx/conf.d/default.conf \
&& mkdir -p /usr/share/nginx/html/static \
&& mkdir -p /usr/share/nginx/html/media \
&& mkdir -p /usr/share/nginx/ssl
ADD ./nginx.conf /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
