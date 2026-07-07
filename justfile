default: help
help:
  @echo "📦 Available commands:"
  @echo ""
  @echo "Environment:"
  @echo "  just create [--force]   # 🔧 Create environment"
  @echo "  just start              # 🚀 Start services"
  @echo "  just stop               # 🧹 Stop services"

create *args: stop
  @echo "🔧 Creating environment"
  @docker compose up --build --force-recreate

start:
  @echo "🚀 Starting container"
  @docker compose up -d

stop:
  @echo "🧹 Stopping container"
  @docker compose down -v
