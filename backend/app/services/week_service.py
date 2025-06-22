from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import Week
from app.db.models.category import Category
from app.db.models.lead_metric import LeadMetric
from app.db.models.source import Source
from app.schemas.lead_metric import CategoryInWeekAndSource
from app.schemas.week import SourceInWeek, WeekCreate, WeekUpdate

async def get_all_weeks(session: AsyncSession) -> Sequence[Week]:
    result = await session.execute(select(Week).order_by(Week.start_date))
    return result.scalars().all()

async def get_week_by_id(session: AsyncSession, week_id: int) -> Week | None:
    result = await session.execute(select(Week).where(Week.id == week_id))
    return result.scalar_one_or_none()

async def create_week_in_db(session: AsyncSession, week_data: WeekCreate) -> tuple[Week, bool]:
    stmt = select(Week).where(
        Week.start_date == week_data.start_date,
        Week.end_date == week_data.end_date
    )
    result = await session.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return existing, False

    week = Week(**week_data.model_dump())
    session.add(week)
    await session.commit()
    await session.refresh(week)
    return week, True

async def update_week_in_db(session: AsyncSession, week: Week, update_data: WeekUpdate) -> Week:
    for field, value in update_data.model_dump().items():
        setattr(week, field, value)
    await session.commit()
    await session.refresh(week)
    return week

async def delete_week_in_db(session: AsyncSession, week: Week) -> None:
    await session.delete(week)
    await session.commit()



async def get_sources_by_week(week_id: int, session: AsyncSession) -> list[SourceInWeek]:
    result = await session.execute(
        select(Source.id, Source.name)
        .join(LeadMetric)
        .where(LeadMetric.week_id == week_id)
        .distinct()
    )
    return [SourceInWeek(id=row.id, name=row.name) for row in result.all()]

async def get_categories_by_week_and_source(week_id: int, source_id: int, session: AsyncSession) -> list[CategoryInWeekAndSource]:
    result = await session.execute(
        select(Category.id, Category.name)
        .join(LeadMetric)
        .where(LeadMetric.week_id == week_id, LeadMetric.source_id == source_id)
        .distinct()
    )
    return [CategoryInWeekAndSource(id=row.id, name=row.name) for row in result.all()]