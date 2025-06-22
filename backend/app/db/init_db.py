from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from datetime import date
import random
import asyncio

from app.db.models.source import Source
from app.db.session import async_session, create_tables
from app.db.models import Category, Week, LeadMetric
from app.schemas.enum.lead import LeadPricingType


async def create_initial_data(session: AsyncSession):
    # Create tables if not existing
    await create_tables()

    category_names = [
        'Москва', 'Абакан', 'М+Р',
        'Зеленоград', 'Адлер', 'Барнаул',
        'Брянск', 'Казань'
    ]

    sources_names = [
        'Яндекс.Поиск', 'Таргет Вконтакте',
        'Посевы Telegram', 'Яндекс Карты МСК',
        'Flocktory', 'TG ADS'
    ]

    weeks_data = [
        {
            'start_date': date(2024, 5, 29),
            'end_date': date(2024, 6, 4)
        },
        {
            'start_date': date(2024, 6, 5),
            'end_date': date(2024, 6, 11)
        },
        {
            'start_date': date(2024, 6, 12),
            'end_date': date(2024, 6, 18)
        },
        {
            'start_date': date(2024, 6, 19),
            'end_date': date(2024, 6, 24)
        },
        {
            'start_date': date(2024, 6, 26),
            'end_date': date(2024, 7, 2)
        },
        {
            'start_date': date(2024, 7, 3),
            'end_date': date(2024, 7, 9)
        },
        {
            'start_date': date(2024, 7, 10),
            'end_date': date(2024, 7, 16)
        },
        {
            'start_date': date(2024, 7, 17),
            'end_date': date(2024, 7, 24)
        }
    ]

    # Add Initial Categories
    for name in category_names:
        result = await session.execute(select(Category).where(Category.name == name))
        existing = result.scalar_one_or_none()
        if not existing:
            session.add(Category(name=name))

    # Add initial Sources
    for name in sources_names:
        result = await session.execute(select(Source).where(Source.name == name))
        existing = result.scalar_one_or_none()
        pricing_type = LeadPricingType.TOTAL_DIVIDED
        if name == 'Flocktory':
            pricing_type = LeadPricingType.FIXED_PER_LEAD
        if not existing:
            session.add(Source(name=name, pricing_type=pricing_type))

    # Add initial Weeks
    for el in weeks_data:
        result = await session.execute(select(Week).where(
            Week.start_date == el['start_date'],
            Week.end_date == el['end_date']
        ))
        existing = result.scalar_one_or_none()
        if not existing:
            session.add(Week(start_date=el['start_date'], end_date=el['end_date']))

    categories = (await session.execute(select(Category))).scalars().all()
    sources = (await session.execute(select(Source))).scalars().all()
    weeks = (await session.execute(select(Week))).scalars().all()

    for category in categories:
        for source in sources:
            for week in weeks:
                result = await session.execute(
                    select(LeadMetric).where(
                        (LeadMetric.category_id == category.id) &
                        (LeadMetric.source_id == source.id) &
                        (LeadMetric.week_id == week.id)
                    )
                )
                existing = result.scalar_one_or_none()
                if existing:
                    continue

                # existing = await session.execute(
                #     select(LeadMetric).where(
                #         LeadMetric.category_id == category.id,
                #         LeadMetric.source_id == source.id
                #     )
                # )
                # if not existing.scalar_one_or_none():
                session.add(LeadMetric(
                category_id=category.id,
                source_id=source.id,
                week_id=week.id,
                amount=random.randint(5000, 100000),
                leads_count=random.randint(1, 100)
            ))

    await session.commit()



async def init_db():
    async with async_session() as session:
        await create_initial_data(session)


if __name__ == "__main__":
    asyncio.run(init_db())
