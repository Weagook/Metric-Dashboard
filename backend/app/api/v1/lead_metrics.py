from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.lead_metric import LeadMetricRead, LeadMetricCreate, LeadMetricUpdate
from app.services.lead_metric_service import *
from app.schemas.response import ResponseModel

router = APIRouter(prefix='/lead_metrics', tags=['LeadMetrics'])


@router.get('/', response_model=ResponseModel[List[LeadMetricRead]])
async def read_leads(
    week_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    source_id: Optional[int] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    leads = await get_leads_filtered(session, week_id, category_id, source_id)
    return ResponseModel(status='ok', data=leads, message='List all lead metrics')


@router.get('/{metric_id}', response_model=ResponseModel[LeadMetricRead])
async def get_lead_metric(metric_id: int, session: AsyncSession = Depends(get_session)):
    metric = await get_lead_metric_by_id(session, metric_id)
    if not metric:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(status='error', message='Metric not found', errors={'code': 404}).model_dump()
        )
    return ResponseModel(status='ok', data=metric, message='Metric found')


@router.post('/', response_model=ResponseModel[LeadMetricRead], status_code=status.HTTP_201_CREATED)
async def create_lead_metric(metric_data: LeadMetricCreate, session: AsyncSession = Depends(get_session)):
    metric, created = await create_lead_metric_in_db(session, metric_data)
    message = 'Metric created' if created else 'Metric already exists'
    return ResponseModel(status='ok', data=metric, message=message)


@router.put('/{metric_id}', response_model=ResponseModel[LeadMetricRead])
async def update_lead_metric(
    metric_id: int,
    metric_data: LeadMetricUpdate,
    session: AsyncSession = Depends(get_session)
):
    metric = await get_lead_metric_by_id(session, metric_id)
    if not metric:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(status='error', message='Metric not found', errors={'code': 404}).model_dump()
        )
    metric = await update_lead_metric_in_db(session, metric, metric_data)
    return ResponseModel(status='ok', data=metric, message='Metric updated')


@router.delete('/{metric_id}', response_model=ResponseModel[None])
async def delete_lead_metric(metric_id: int, session: AsyncSession = Depends(get_session)):
    metric = await get_lead_metric_by_id(session, metric_id)
    if not metric:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(status='error', message='Metric not found', errors={'code': 404}).model_dump()
        )
    await delete_lead_metric_in_db(session, metric)
    return ResponseModel(status='ok', data=None, message='Metric deleted')
