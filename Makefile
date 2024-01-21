all:
	sudo sh ./_certificat/script.sh
	docker compose up --build

up:		
	docker compose up

build:
	docker compose build

down: 
	docker compose down

stop:
	docker compose stop

fclean: stop
	docker system prune -af
	docker volume prune -af
	docker network prune -f
	rm -f transcendence.crt
	rm -f transcendence.key
	sudo rm -rf ./backend/certificat
	sudo rm -rf ./frontend/certificat

re: fclean all

status:
	@echo "\nDOCKER STATUS:\n"
	# list all containers:
	docker ps
	@echo "\n"

	# list all the containers available locally:
	docker ps -a
	@echo "\n"

	# list images:
	docker images
	@echo "\n"

	# list all volumes:
	docker volume ls
	@echo "\n"

	# list all networks:
	docker network ls



.PHONY: up build all down stop re fclean status
