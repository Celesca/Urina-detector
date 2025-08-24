# Makefile for Urine Detector Docker Setup

.PHONY: help build up down logs clean dev-up dev-down status restart

help: ## Show this help message
	@echo "Urine Detector Docker Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker-compose build

up: ## Start production services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

status: ## Show service status
	docker-compose ps

restart: ## Restart all services
	docker-compose restart

dev-up: ## Start development services
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development services
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yml logs -f

clean: ## Clean up Docker resources
	docker-compose down -v
	docker system prune -f

rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

health: ## Check service health
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/health || echo "Backend not responding"
	@echo ""
	@echo "Checking frontend..."
	@curl -f http://localhost:3000 || echo "Frontend not responding"

install: ## Initial setup
	@echo "Setting up Urine Detector..."
	@if [ ! -f "./backend/models/40_epochs.pth" ]; then \
		echo "⚠️  Warning: Model file not found at ./backend/models/40_epochs.pth"; \
		echo "   Please place your model file in this location."; \
	fi
	@mkdir -p ./backend/models ./backend/images
	@echo "Ready to start with 'make up' or 'make dev-up'"
