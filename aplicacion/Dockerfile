# La imagen oficial de PHP con Apache, más lo mínimo que le falta para este proyecto.
FROM php:8.3-apache

# El driver de MySQL para PDO (la imagen oficial no trae ninguno).
RUN docker-php-ext-install pdo_mysql

# La configuración "de desarrollo" de PHP: muestra los errores en pantalla.
# En un servidor real se usaría php.ini-production (los errores van al log, no al navegador).
RUN cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# Que date() y las fechas de las órdenes salgan en hora local.
RUN echo "date.timezone = America/Montevideo" > "$PHP_INI_DIR/conf.d/zona.ini"
