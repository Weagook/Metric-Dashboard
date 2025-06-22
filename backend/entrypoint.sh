#!/bin/sh

if [ ! -f .env ]; then
  echo ".env not found, copying from .env.example"
  cp .env.example .env
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
