## option-mi

## Loading Option Chain Data

run the command from project root folder

node .\dataLoader\optionChain\nse\dataLoader.js
node .\dataLoader\underlyingConfig\dataLoader.js
node .\dataLoader\historicalData\nse\index\dataLoader.js
node .\dataLoader\historicalData\nse\index\priceLoader.js

node ./backtest/backtest.js

## select str_to_date(expiryDate,'%d-%b-%Y'), expiryDate from optionsmidev.watchlists

## .env

## Dev

PORT=5000
ORIGIN=http://localhost:3000
API_SERVER=http://localhost:5000/api
JWT_SECRET=Option$Mi!JWT*SEC*0-9-1-7-3-5-4-6-2-8
NODE_ENV=development

DB_USERNAME=optionsmidev
DB_PASSWORD=Optionsmidev1!
DB_NAME=optionsmidev
DB_HOST=127.0.0.1
DB_DIALECT=mariadb

## Test

sudo nano .env

PORT=5000
ORIGIN=https://test.optionsmi.com/
API_SERVER=https://test.optionsmi.com/api
JWT_SECRET=Option$Mi!JWT*SEC*0-9-1-7-3-5-4-6-2-8
NODE_ENV=development

DB_USERNAME=optionsmitest
DB_PASSWORD=Optionsmi$test1!
DB_NAME=optionsmitest
DB_HOST=127.0.0.1
DB_DIALECT=mariadb

##

VPS ip address : 194.31.53.22

## Server

## Hard disk Memory

sudo df -h

## Processor

sudo neofetch

## RAM and services

sudo htop

## SSH

## Generating the SSH Keys in your local terminal

ssh-keygen -t rsa

## Copy ssh public key to the VSP server

ssh-copy-id root@194.31.53.22
ssh-copy-id vijay@194.31.53.22
ssh-copy-id -p 1050 vijay@194.31.53.22

## Login to the VPS server

ssh root@194.31.53.22
ssh vijay@194.31.53.22

## after port change

ssh -p 1050 root@194.31.53.22
ssh -p 1050 vijay@194.31.53.22

## Change the Default SSH Port

sudo nano /etc/ssh/sshd_config
sudo service ssh restart

## Creating user in server

adduser vijay
usermod -aG sudo vijay

## Updating server

sudo apt update
sudo apt upgrade -y

sudo apt-get update && sudo apt-get upgrade

sudo dpkg-query -l 'post\*'
sudo apt remove --purge package_name
sudo apt clean

## Set the Timezone

sudo timedatectl list-timezones

sudo timedatectl set-timezone 'Asia/Kolkata'

sudo date

## Installing Iptables

sudo apt-get update
sudo apt-get install iptables

## Check the status of your current iptables configuration

sudo iptables -L -v

## Defining Chain Rules

## Enabling Traffic on Localhost

sudo iptables -A INPUT -i lo -j ACCEPT

sudo iptables -A INPUT -p tcp --dport 1050 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

## Persisting Changes

iptables -L > iptables-save

## UFW

sudo apt-get install ufw

sudo ufw enable
sudo ufw status
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 1050/tcp
sudo ufw default allow outgoing

sudo ufw reject from 202.54.5.7 to any

sudo ufw status verbose
sudo ufw status numbered
sudo ufw delete 3

## Installing Fail2ban

sudo apt install fail2ban -y
sudo systemctl status fail2ban

sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

sudo systemctl restart fail2ban.service
sudo systemctl enable fail2ban.service

## Deleting apache server

sudo systemctl status apache2
sudo systemctl stop apache2
sudo systemctl disable apache2
sudo apt remove apache2
sudo apt autoremove

## Cleaning server

rm -rf /var/www/html

## Nginx

## Installing Nginx

sudo apt install nginx

sudo nginx -v

## Configure

sudo rm /etc/nginx/sites-available/default
sudo rm /etc/nginx/sites-enabled/default

sudo nano /etc/nginx/sites-available/default
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

server {
listen 80;
server_name optionsmi.com www.optionsmi.com;
location / {
root /var/www/optionsmi;
index index.html index.htm;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
try_files $uri $uri/ /index.html;
}
}

server {
listen 80;
server_name test.optionsmi.com;
location / {
proxy_pass http://194.31.53.22:5000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}
}

##

nano /var/www/optionsmi/index.html

# Check NGINX config

sudo nginx -t

# Restart NGINX

sudo service nginx restart

## Start

sudo systemctl start nginx

sudo systemctl status nginx

## SSL

sudo apt install certbot python3-certbot-nginx

sudo certbot --nginx -d optionsmi.com -d www.optionsmi.com
sudo certbot --nginx -d test.optionsmi.com
sudo certbot --nginx -d admin.optionsmi.com

sudo systemctl status certbot.timer

## Installing Node JS

## Ubuntu

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

## Installing Maria DB

sudo apt install mariadb-server
sudo systemctl status mariadb

mysql -v

## Is status is disabled

sudo systemctl enable mariadb

## secure installation

sudo mysql_secure_installation

## Login

sudo mysql -u root -p

## db and user creation

CREATE DATABASE optionsmitest;
SHOW DATABASES;

CREATE USER 'optionsmitest'@localhost IDENTIFIED BY 'Optionsmi$test1!';
SELECT User FROM mysql.user;
GRANT ALL PRIVILEGES ON optionsmitest.\* TO 'optionsmitest'@localhost;
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'optionsmitest'@localhost;

## Installing GIT

sudo apt-get install git

## Installing the app

git clone https://github.com/options-mi/options-mi-server.git

git pull origin main --allow-unrelated-histories

npm install

sudo npm i pm2 -g

sudo pm2 start server.js --name optionsmi-test

# Other pm2 commands

sudo pm2 show optionsmi-test
sudo pm2 status
sudo pm2 restart optionsmi-test
sudo pm2 stop optionsmi-test
sudo pm2 logs (Show log stream)
sudo pm2 flush (Clear logs)

sudo pm2 monit

# To make sure app starts when reboot

sudo pm2 startup ubuntu

## Valoris

git hub

git clone https://github.com/Valoris-Solutions/website.git

server {
listen 80;
server_name valorissolutions.com www.valorissolutions.com;
location / {
root /var/www/valoris/website;
index index.html index.htm;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
try_files $uri $uri/ /index.html;
}
}

sudo certbot --nginx -d valorissolutions.com -d www.valorissolutions.com

sudo systemctl status certbot.timer

server {
listen 80;
server_name admin.optionsmi.com;

      location / {
            proxy_pass https://127.0.0.1:10000;
            proxy_redirect off;

            #Proxy Settings
            proxy_redirect     off;
            proxy_set_header   Host             $host:$server_port;
            proxy_set_header   X-Real-IP        $remote_addr;
            proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;

            proxy_max_temp_file_size 0;
            proxy_connect_timeout      90;
            proxy_send_timeout         90;
            proxy_read_timeout         90;
            proxy_buffer_size          128k;
            proxy_buffers              32 32k;
            proxy_busy_buffers_size    256k;
            proxy_temp_file_write_size 256k;
      }

}
