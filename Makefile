build:
	docker compose build

start:
	docker compose up -d

init-db:
	docker compose exec db sh -c "psql -U postgres < /root/database/init.sql"

status:
	docker compose ps
