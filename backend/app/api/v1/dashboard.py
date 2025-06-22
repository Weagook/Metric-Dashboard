from typing import List
from datetime import date


from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.response import ResponseModel
from app.services.dashboard_service import get_lead_metrics_by_weeks, get_summary_stats_overview, get_stats_by_category, get_stats_by_source
from app.schemas.lead_overview import LeadOverview
from app.schemas.lead_stats import LeadStatsSummary
from app.schemas.lead_metrics_by_week import LeadMetricGroupedByWeekSchema


router = APIRouter(prefix='/dashboard', tags=['Dashboard'])

@router.get('/lead_overview', response_model=ResponseModel[LeadOverview])
async def get_lead_overview(session: AsyncSession = Depends(get_session)):
    result = await get_summary_stats_overview(session)
    return ResponseModel(
        status='ok',
        data=result,
        message='Lead overview summary'
    )

@router.get('/category/{category_id}', response_model=ResponseModel[LeadStatsSummary])
async def category_stats(
    category_id: int,
    from_date: date | None = Query(None, description="Дата начала диапазона"),
    to_date: date | None = Query(None, description="Дата конца диапазона"),
    session: AsyncSession = Depends(get_session)
):
    stats = await get_stats_by_category(session, category_id, from_date, to_date)
    return ResponseModel(
        status='ok',
        data=stats,
        message='Category stats calculated'
    )

@router.get('/source/{source_id}', response_model=ResponseModel[LeadStatsSummary])
async def source_stats(
    source_id: int,
    from_date: date | None = Query(None, description="Дата начала диапазона"),
    to_date: date | None = Query(None, description="Дата конца диапазона"),
    session: AsyncSession = Depends(get_session)
):
    stats = await get_stats_by_source(session, source_id, from_date, to_date)
    return ResponseModel(
        status='ok',
        data=stats,
        message='Source stats calculated'
    )


@router.get('/lead_metrics_by_weeks', response_model=ResponseModel[List[LeadMetricGroupedByWeekSchema]])
async def lead_metrics_by_weeks(session: AsyncSession = Depends(get_session)):
    data = await get_lead_metrics_by_weeks(session)
    return ResponseModel(
        status='ok',
        data=data,
        message='Metrics by week successfully fetched'
    )