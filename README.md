# ZSH Site New FUN

```bash
# Utilizando ZSH para crear una nueva configuración de Nginx con un solo comando

site-new
```

## Necesitas
Tener instalado ZSH y Nginx

<!-- usa estos enlace para generar sugerencia de instalación zsh y ohmy-zsh https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH  https://ohmyz.sh/-->
Instalar ZSH
[Instalar ZSH](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH)

Instalar Oh My Zsh
[Instalar Oh My Zsh](https://ohmyz.sh/)

Contar con servidor Nginx instalado
[Instalar Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)


En tu archivo .zshrc agrega el siguiente código, justo al final del archivo

```bash
function create_new_site() {
    local site_name="$1"
    local php_version="$2"
    local path_site="$3"
    local domain="$4"
    local subdominio="$5"
    # Solicitaremos las variables necesarias para crear el nuevo sitio
    if [ ! -n "${(p)site_name}" ]; then
        echo "\nDefine la variable site_name para crear un nuevo sitio..\nejemplo: site_name=nombre_sitio"
        # Solicitar el nombre del sitio al usuario
        echo "Ingrese el nombre del sitio:"
        read site_name
    fi
    if [ ! -n "${(p)path_site}" ]; then
        echo "\nDefine la variable path_site para crear un nuevo sitio..\nejemplo: path_site=/var/www/html/"
        # Solicitar el nombre del sitio al usuario
        echo "Ingrese el path_site del sitio:"
        read path_site
    fi
    if [ ! -n "${(p)php_version}" ]; then
        echo "\nDefine la variable php_version, si no se define se usara la version de php por defecto.\nejemplo: php_version=7.4\n debe ser una version de php instalada en el servidor"
        # Solicitar el nombre del sitio al usuario
        echo "Ingrese la version de php:"
        read php_version
    fi
    if [ ! -n "${(p)domain}" ]; then
        echo "\nDefine la variable domain y no incluyas el subdominio, ni www.\nejemplo: domain=domain.cl"
        # Solicitar el nombre del sitio al usuario
        echo "Ingrese el dominio del sitio:"
        read domain
    fi

    if [ ! -n "${(p)subdominio}" ]; then
        echo "\nDefine la variable subdominio y no incluyas el dominio principal ${(p)domain} ni www.\nejemplo: subdominio=app"
        # Solicitar el nombre del sitio al usuario
        echo "Ingrese el subdominio del sitio:"
        read subdominio
    fi
   
    if [ -n "${(p)site_name}" ]; then
        # Directorio de archivos disponibles
        sites_available="/etc/nginx/sites-available"

        # Crear archivo de configuración
        echo "server {
            listen 80;
            listen [::]:80;

            # Carpeta pública
            root $path_site/$site_name;

            index index.html index.htm index.php;

            # Archivo de log
            error_log /var/log/nginx/$domain.log error;

            # Dominio
            server_name $subdominio.$domain www.$subdominio.$domain;

            location / {
                try_files \$uri \$uri/ /index.php?\$query_string;
            }

            location ~ \.php$ {
                # Versión de PHP
                fastcgi_pass unix:/run/php/php$php_version-fpm.sock;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
                try_files \$uri =404;
                include fastcgi_params;
            }

            error_page 404 /404.html;
            error_page 500 502 503 504 /50x.html;

            location = /50x.html {
                root /usr/share/nginx/html;
            }

        }" > "$sites_available/$subdominio.$domain"

        # Habilitar el sitio
        sudo ln -s "$sites_available/$subdominio.$domain" /etc/nginx/sites-enabled

        # Recargar Nginx
        sudo systemctl reload nginx

        # Consultar por cerbot
        echo "¿Desea instalar un certificado SSL con Let's Encrypt, usando cerbot? (s/n)"
        read cerbot
        if [ "$cerbot" = "s" ]; then
            sudo certbot --nginx -d $subdominio.$domain -d www.$subdominio.$domain
        fi

        # Mensaje de éxito
        echo "\nSe ha creado un nuevo sitio con nombre: $site_name.$domain\n"
    fi
}

remove_site() {
    local site_name="$1"
    if [ ! -n "${(p)site_name}" ]; then
      echo "Ingrese el nombre del sitio\n ejemplo: site_name=sub.dominio.cl"
      read site_name
    fi
    if [ -n "${(p)site_name}" ]; then
        if [ -f /etc/nginx/sites-available/${(p)site_name} ]; then
            echo "Estas removiendo el sitio con nombre $site_name" && sudo rm /etc/nginx/sites-available/${(p)site_name} && sudo rm /etc/nginx/sites-enabled/${(p)site_name}
            # Actualizar la configuración de Nginx
            sudo systemctl reload nginx
        else
            echo "El sitio con nombre $site_name no existe."
        fi
    fi
}

alias ngnix-restart="sudo systemctl restart nginx.service"
alias site-new='create_new_site "$site_name" "$php_version" "$path_site" "$domain" "$subdominio"'
alias site-remove='remove_site "$site_name"'
```
