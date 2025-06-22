``` bash
    project-root/
    │
    ├── backend/
    │   ├── app/
    │   │   ├── api/                # Роутеры
    │   │   │   ├── v1/
    │   │   │   │   ├── dashboard.py
    │   │   │   │   ├── auth.py
    │   │   │   │   └── ...
    │   │   │   └── dependencies.py
    │   │   │
    │   │   ├── core/               # Настройки, конфигурации, security
    │   │   │   ├── config.py       # Pydantic Settings
    │   │   │   ├── security.py     # JWT, hash, OAuth2PasswordBearer
    │   │   │   └── logging.py
    │   │   │
    │   │   ├── crud/               # Бизнес-логика для работы с БД
    │   │   │   ├── user.py
    │   │   │   ├── dashboard.py
    │   │   │   └── ...
    │   │   │
    │   │   ├── db/
    │   │   │   ├── session.py      # async sessionmaker
    │   │   │   ├── base.py         # Base = declarative_base()
    │   │   │   ├── models/
    │   │   │   │   ├── user.py
    │   │   │   │   ├── dashboard.py
    │   │   │   │   └── ...
    │   │   │   └── migrations/     # Alembic (если используешь)
    │   │   │
    │   │   ├── schemas/            # Pydantic-схемы
    │   │   │   ├── user.py
    │   │   │   ├── dashboard.py
    │   │   │   └── ...
    │   │   │
    │   │   ├── services/           # Внешние сервисы, логика (например, генерация Excel, аналитика)
    │   │   │   ├── excel_exporter.py
    │   │   │   └── ...
    │   │   │
    │   │   ├── main.py             # FastAPI app
    │   │   └── deps.py             # Depends-контейнеры
    │   │
    │   └── pyproject.toml          # Poetry конфигурация
    │
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   │   ├── assets/
    │   │   ├── components/
    │   │   │   ├── charts/
    │   │   │   ├── layout/
    │   │   │   ├── auth/
    │   │   │   └── ...
    │   │   ├── pages/
    │   │   │   ├── Dashboard.tsx
    │   │   │   ├── Login.tsx
    │   │   │   └── ...
    │   │   ├── services/           # API-запросы (axios + JWT интерцепторы)
    │   │   ├── hooks/
    │   │   ├── router/
    │   │   ├── store/              # Zustand / Redux Toolkit
    │   │   ├── types/
    │   │   └── main.tsx
    │   └── vite.config.ts
    │
    ├── docker/
    │   ├── backend.dockerfile
    │   ├── frontend.dockerfile
    │   └── nginx.conf
    │
    ├── .env
    ├── docker-compose.yml
    └── README.md
