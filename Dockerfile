# Servidor web Nginx para producción (Optimizado para compilación local sin internet)
FROM nginx:1.27-alpine

# Copiar compilado estático generado en el host
COPY dist /usr/share/nginx/html

# Copiar configuración personalizada de redirección SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
