from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.source import SourceRead, SourceCreate, SourceUpdate
from app.services.source_service import *
from app.schemas.response import ResponseModel

router = APIRouter(prefix='/sources', tags=['Sources'])


@router.get('/', response_model=ResponseModel[List[SourceRead]])
async def get_sources(session: AsyncSession = Depends(get_session)):
    sources = await get_all_sources(session)
    return ResponseModel(
        status='ok',
        data=sources,
        message='List all sources'
    )


@router.get('/{source_id}', response_model=ResponseModel[SourceRead])
async def get_source(source_id: int, session: AsyncSession = Depends(get_session)):
    source = await get_source_by_id(session, source_id)
    if not source:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Source with such id does not exist',
                errors={'code': 404}
            ).model_dump()
        )

    return ResponseModel(
        status='ok',
        data=source,
        message='Source found'
    )


@router.post('/', response_model=ResponseModel[SourceRead], status_code=status.HTTP_201_CREATED)
async def create_source(
    source_data: SourceCreate,
    session: AsyncSession = Depends(get_session)
):
    source, created = await create_source_in_db(session, source_data)

    if created:
        return ResponseModel(
            status='ok',
            data=source,
            message='Source created'
        )
    else:
        return ResponseModel(
            status='ok',
            data=source,
            message='Source already exists'
        )


@router.put('/{source_id}', response_model=ResponseModel[SourceRead])
async def update_source(
    source_id: int,
    source_data: SourceUpdate,
    session: AsyncSession = Depends(get_session)
):
    source = await get_source_by_id(session, source_id)
    if not source:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Source not found',
                errors={'code': 404}
            ).model_dump()
        )
    updated_source = await update_source_in_db(session, source, source_data)
    return ResponseModel(
        status='ok',
        data=updated_source,
        message='Source updated'
    )



@router.delete('/{source_id}', response_model=ResponseModel[None])
async def delete_source(source_id: int, session: AsyncSession = Depends(get_session)):
    source = await get_source_by_id(session, source_id)
    if not source:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Source not found',
                errors={'code': 404}
            ).model_dump()
        )
    await delete_source_in_db(session, source)
    return ResponseModel(
        status='ok',
        data=None,
        message='Source deleted'
    )