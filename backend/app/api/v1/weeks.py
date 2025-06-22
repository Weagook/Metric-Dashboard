from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.category import Category
from app.db.models.lead_metric import LeadMetric
from app.db.models.source import Source
from app.db.session import get_session
from app.schemas.lead_metric import CategoriesInWeekAndSourceResponse
from app.schemas.week import SourcesInWeekResponse, WeekRead, WeekUpdate
from app.services.week_service import *
from app.schemas.response import ResponseModel

router = APIRouter(prefix='/weeks', tags=['Weeks'])


@router.get('/', response_model=ResponseModel[List[WeekRead]])
async def get_weeks(session: AsyncSession = Depends(get_session)):
    week = await get_all_weeks(session)
    return ResponseModel(
        status='ok',
        data=week,
        message='List all weeks'
    )


@router.get('/{week_id}', response_model=ResponseModel[WeekRead])
async def get_week(week_id: int, session: AsyncSession = Depends(get_session)):
    week = await get_week_by_id(session, week_id)
    if not week:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Week with such id does not exist',
                errors={'code': 404}
            ).model_dump()
        )

    return ResponseModel(
        status='ok',
        data=week,
        message='Week found'
    )


@router.get("/{week_id}/sources", response_model=SourcesInWeekResponse)
async def get_sources_by_week(week_id: int, session: AsyncSession = Depends(get_session)):
    stmt = (
        select(Source.id, Source.name)
        .join(LeadMetric)
        .where(LeadMetric.week_id == week_id)
        .distinct()
    )
    result = await session.execute(stmt)
    sources = [{"id": row.id, "name": row.name} for row in result.all()]
    return {"status": "ok", "data": sources, "message": "", "errors": None}


@router.get("/{week_id}/sources/{source_id}/categories", response_model=CategoriesInWeekAndSourceResponse)
async def get_categories_by_week_and_source(week_id: int, source_id: int, session: AsyncSession = Depends(get_session)):
    stmt = (
        select(Category.id, Category.name, LeadMetric.amount, LeadMetric.leads_count)
        .join(LeadMetric)
        .where(
            LeadMetric.week_id == week_id,
            LeadMetric.source_id == source_id,
            LeadMetric.category_id == Category.id
        )
    )
    result = await session.execute(stmt)
    categories = [
        {
            "id": row.id,
            "name": row.name,
            "amount": row.amount,
            "leads_count": row.leads_count,
        }
        for row in result.all()
    ]
    return {"status": "ok", "data": categories, "message": "", "errors": None}



@router.post('/', response_model=ResponseModel[WeekRead], status_code=status.HTTP_201_CREATED)
async def create_week(
    week_data: WeekCreate,
    session: AsyncSession = Depends(get_session)
):
    week, created = await create_week_in_db(session, week_data)

    if created:
        return ResponseModel(
            status='ok',
            data=week,
            message='Week created'
        )
    else:
        return ResponseModel(
            status='ok',
            data=week,
            message='Week already exists'
        )


@router.put('/{week_id}', response_model=ResponseModel[WeekRead])
async def update_week(
    week_id: int,
    week_data: WeekUpdate,
    session: AsyncSession = Depends(get_session)
):
    week = await get_week_by_id(session, week_id)
    if not week:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Week not found',
                errors={'code': 404}
            ).model_dump()
        )
    updated_week = await update_week_in_db(session, week, week_data)
    return ResponseModel(
        status='ok',
        data=updated_week,
        message='week updated'
    )



@router.delete('/{week_id}', response_model=ResponseModel[None])
async def delete_week(week_id: int, session: AsyncSession = Depends(get_session)):
    week = await get_week_by_id(session, week_id)
    if not week:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Week not found',
                errors={'code': 404}
            ).model_dump()
        )
    await delete_week_in_db(session, week)
    return ResponseModel(
        status='ok',
        data=None,
        message='Week deleted'
    )