from typing import Sequence, Tuple

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import Source
from app.schemas.source import SourceCreate, SourceUpdate

async def get_all_sources(session: AsyncSession) -> Sequence[Source]:
    result = await session.execute(select(Source))
    return result.scalars().all()


async def get_source_by_id(session: AsyncSession, source_id: int) -> Source | None:
    result = await session.execute(select(Source).where(Source.id == source_id))
    return result.scalar_one_or_none()


async def create_source_in_db(session: AsyncSession, source_data: SourceCreate) -> Tuple[Source, bool]:
    result = await session.execute(
        select(Source).where(Source.name == source_data.name)
    )
    existing_source = result.scalars().first()

    if existing_source:
        return existing_source, False

    new_source = Source(name=source_data.name)
    session.add(new_source)
    await session.commit()
    await session.refresh(new_source)
    return new_source, True


async def update_source_in_db(
    session: AsyncSession,
    source: Source,
    source_data: SourceUpdate
) -> Source:
    if source_data.name is not None and source_data.name != source.name:
        result = await session.execute(
            select(Source).where(Source.name == source_data.name)
        )
        existing = result.scalars().first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail='Источник с таким именем уже существует'
            )

        source.name = source_data.name

    session.add(source)
    await session.commit()
    await session.refresh(source)
    return source


async def delete_source_in_db(session: AsyncSession, source: Source) -> None:
    await session.delete(source)
    await session.commit()