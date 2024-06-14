docker compose down
docker compose up -d mysql
docker compose build nodejs
sleep 3
docker compose up nodejs
