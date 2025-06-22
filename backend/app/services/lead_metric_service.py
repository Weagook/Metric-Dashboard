from typing import List, Optional, Sequence, Tuple

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import LeadMetric
from app.schemas.lead_metric import LeadMetricCreate, LeadMetricUpdate


async def get_leads_filtered(
    session: AsyncSession,
    week_id: Optional[int],
    category_id: Optional[int],
    source_id: Optional[int],
) -> Sequence[LeadMetric]:
    query = select(LeadMetric)

    if week_id is not None:
        query = query.where(LeadMetric.week_id == week_id)
    if category_id is not None:
        query = query.where(LeadMetric.category_id == category_id)
    if source_id is not None:
        query = query.where(LeadMetric.source_id == source_id)

    result = await session.execute(query)
    leads = result.scalars().all()
    return leads


async def get_all_lead_metrics(session: AsyncSession):
    result = await session.execute(select(LeadMetric))
    return result.scalars().all()


async def get_lead_metric_by_id(session: AsyncSession, metric_id: int):
    return await session.get(LeadMetric, metric_id)


async def create_lead_metric_in_db(
    session: AsyncSession,
    metric_data: LeadMetricCreate
) -> Tuple[LeadMetric, bool]:
    result = await session.execute(
        select(LeadMetric).where(
            (LeadMetric.category_id == metric_data.category_id) &
            (LeadMetric.source_id == metric_data.source_id) &
            (LeadMetric.week_id == metric_data.week_id)
        )
    )
    existing = result.scalars().first()
    if existing:
        return existing, False

    new_metric = LeadMetric(
        amount=metric_data.amount,
        leads_count=metric_data.leads_count,
        category_id=metric_data.category_id,
        source_id=metric_data.source_id,
        week_id=metric_data.week_id
    )

    session.add(new_metric)
    await session.commit()
    await session.refresh(new_metric)

    return new_metric, True


async def update_lead_metric_in_db(
    session: AsyncSession,
    metric: LeadMetric,
    metric_data: LeadMetricUpdate
) -> LeadMetric:
    is_same_combo = (
        metric.category_id == metric_data.category_id and
        metric.source_id == metric_data.source_id and
        metric.week_id == metric_data.week_id
    )

    if not is_same_combo:
        result = await session.execute(
            select(LeadMetric).where(
                (LeadMetric.category_id == metric_data.category_id) &
                (LeadMetric.source_id == metric_data.source_id) &
                (LeadMetric.week_id == metric_data.week_id)
            )
        )
        existing = result.scalars().first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail='Метрика с такими category_id, source_id и week_id уже существует'
            )

    metric.amount = metric_data.amount
    metric.leads_count = metric_data.leads_count
    metric.category_id = metric_data.category_id
    metric.source_id = metric_data.source_id
    metric.week_id = metric_data.week_id

    await session.commit()
    await session.refresh(metric)
    return metric


async def delete_lead_metric_in_db(session: AsyncSession, metric):
    await session.delete(metric)
    await session.commit()
