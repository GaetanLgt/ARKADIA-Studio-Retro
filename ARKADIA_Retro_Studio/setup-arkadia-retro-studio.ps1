services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "8080:8080"
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
      # Base de donnees : SQLite par defaut, dans le volume ci-dessous
      - DATABASE_URL=sqlite:////app/backend/data/webui.db
      # Pour plus tard, si tu veux passer a Postgres :
      # - DATABASE_URL=postgresql://arkadia:motdepasse@db:5432/openwebui
    volumes:
      - open-webui:/app/backend/data
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: always

volumes:
  open-webui: