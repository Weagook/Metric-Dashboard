from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from typing import AsyncGenerator

from app.core.config import settings
from app.db.base import Base


engine = create_async_engine(settings.database_url, echo=True)

async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency
async def get_session() -> AsyncGenerator[AsyncSession]:
    async with async_session() as session:
        yield session
