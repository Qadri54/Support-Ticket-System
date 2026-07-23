.PHONY: setup api web stats test fresh

setup:
	cd apps/api && composer install && cp -n .env.example .env && php artisan key:generate
	cd apps/api && touch database/database.sqlite && php artisan migrate --seed
	npm install

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
