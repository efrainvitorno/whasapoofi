## Deploy Ubuntu 22.x


```bash
  sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils git
```

Instalar o pacote  build-essential:

```bash
sudo apt-get install build-essential
```

```bash
sudo apt update && sudo apt upgrade
```

Instale o node (16.x) e confirme se o comando do node -v e npm -v está disponível:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```


Instale o docker e adicione seu usuário ao grupo do docker:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh

sudo sh get-docker.sh

sudo usermod -aG docker ${USER}

sudo apt-get install docker-compose
```

Instalar o Postgres Docker 

```bash
docker run -e TZ="America/Lima" --name whasapo -e POSTGRES_USER=whasapo -e POSTGRES_PASSWORD=whasapo -p 5432:5432 -d --restart=always -v /data:/var/lib/postgresql/data -d postgres
```

Instalar o Redis Docker 

```bash
docker run -e TZ="America/Lima" --name redis-whasapo -p 6379:6379 -d --restart=always redis:latest redis-server --appendonly yes --requirepass "whasapo0060"
```

 Criar chave para fazer o clone de repositório privado

```shell
ssh-keygen -t ed25519 -C "your_email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub (copia o conteudo)
adiciona aqui, https://github.com/settings/keys
```

 Clonar este repositório:

```bash
cd ~
git clone https://github.com/efrainvitorno/whasapoofi.git
```
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

Crie um arquivo .env de backend e preencha com as informações correta:

```bash
cp whasapoofi/backend/.env.example whasapoofi/backend/.env
nano whasapoofi/backend/.env
```

```bash
NODE_ENV=prod

BACKEND_URL=http://localhost

FRONTEND_URL=http://localhost:3000

PROXY_PORT=8080

PORT=8080

DB_DIALECT=postgres

DB_HOST=localhost

DB_PORT=5432

DB_USER=user

DB_PASS=senha

DB_NAME=db_name

JWT_SECRET=kZaOTd+YZpjRUyyuQUpigJaEMk4vcW4YOymKPZX0Ts8=

JWT_REFRESH_SECRET=dBSXqFg9TaNUEDXVp6fhMTRLBysP+j2DSqf7+raxD3A=

REDIS_URI=redis://:123456@127.0.0.1:6379

REDIS_OPT_LIMITER_MAX=1

REDIS_OPT_LIMITER_DURATION=3000

USER_LIMIT=10000

CONNECTIONS_LIMIT=100000

GERENCIANET_SANDBOX=false

GERENCIANET_CLIENT_ID=Client_Id_Gerencianet

GERENCIANET_CLIENT_SECRET=Client_Secret_Gerencianet

GERENCIANET_PIX_CERT=certificado-Gerencianet

GERENCIANET_PIX_KEY=chave pix gerencianet

VERIFY_TOKEN=whaticket

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

```

Executa o npm install , cria o build cria as tabela e insere os registro padrão

```bash
cd whasapoofi/backend
npm install
npm run build
npm run db:migrate
npm run db:seed
```

Vá para a pasta frontend e instale as dependências:

```bash
cd ../frontend
cp .env.example .env
nano .env
```

```bash
REACT_APP_BACKEND_URL=https://URL_DO_BACKEND(NAO E URL DO FRONTEND)
REACT_APP_HOURS_CLOSE_TICKETS_AUTO = 24
REACT_APP_FACEBOOK_APP_ID=
```

```bash
npm install
npm run build
```

Instale o pm2 **com sudo** e inicie o backend com ele:

```bash
cd ~
sudo npm install -g pm2

cd ../backend
pm2 start dist/server.js --name whasapo-backend
cd ../frontend
pm2 start server.js --name whasapo-frontend

```

Iniciar pm2 após a reinicialização:

```bash
pm2 startup ubuntu -u `YOUR_USERNAME`
```

Copie a última saída de linha do comando anterior e execute-o, é algo como:

```bash
sudo env PATH=\$PATH:/usr/bin pm2 startup ubuntu -u YOUR_USERNAME --hp /home/YOUR_USERNAM
```

Instale o nginx:

```bash
sudo apt install nginx
```

Remova o site padrão do nginx:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Crie o site para o Backend
```bash
sudo nano /etc/nginx/sites-available/whasapo-backend
```

```bash
server {
  server_name api.whasapo.com;

  location / {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Crie o site para o frontend

```bash
sudo nano /etc/nginx/sites-available/whasapo-frontend
```

```bash
server {
  server_name app.whasapo.com;

  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Crie os links simbólicos para habilitar os sites:

```bash
sudo ln -s /etc/nginx/sites-available/whasapo-backend /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/whasapo-frontend /etc/nginx/sites-enabled
```

Vamos alterar a configuração do nginx para aceitar 20MB de corpo nas requisições:

```bash
sudo nano /etc/nginx/nginx.conf
...

http {
  ...
  client_max_body_size 20M;  # HANDLE BIGGER UPLOADS
}

```

Teste a configuração e reinicie o nginx:

```bash
sudo nginx -t
sudo service nginx restart
```

Agora, ative o SSL (https) nos seus sites para utilizar todas as funcionalidades da aplicação como notificações e envio de mensagens áudio. Uma forma fácil de o fazer é utilizar Certbot:

Instale o certbor com snapd:

```bash
sudo snap install --classic certbot
```

Habilite SSL com nginx:

```bash
sudo certbot --nginx
```


URL WEBHOOK META:

```bash
https://api.seudominio.com.br/webhook/fb
```
