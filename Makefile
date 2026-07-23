.PHONY: setup db api web stats test fresh

setup: db
	cd apps/api && composer install && cp -n .env.example .env && php artisan key:generate
	cd apps/stats && cp -n .env.example .env || true
	cd apps/api && php artisan migrate --seed
	npm install

db:
	mysql -u root -h 127.0.0.1 -e "CREATE DATABASE IF NOT EXISTS Support_Ticket_System CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE DATABASE IF NOT EXISTS Support_Ticket_System_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

fresh:
	cd apps/api && php artisan migrate:fresh --seed

api:
	cd apps/api && php artisan serve

web:
	npm run dev --workspace=apps/web

stats:
	npm run dev --workspace=apps/stats

test:
	cd apps/api && php artisan test
