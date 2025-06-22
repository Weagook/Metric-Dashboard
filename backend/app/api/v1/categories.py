from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.category import CategoryRead, CategoryUpdate, CategoryCreate
from app.services.category_service import *
from app.schemas.response import ResponseModel

router = APIRouter(prefix='/categories', tags=['Categories'])


@router.get('/', response_model=ResponseModel[List[CategoryRead]])
async def get_categories(session: AsyncSession = Depends(get_session)):
    categories = await get_all_categories(session)
    return ResponseModel(
        status='ok',
        data=categories,
        message='List all categories'
    )


@router.get('/{category_id}', response_model=ResponseModel[CategoryRead])
async def get_category(category_id: int, session: AsyncSession = Depends(get_session)):
    category = await get_category_by_id(session, category_id)
    if not category:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Category with such id does not exist',
                errors={'code': 404}
            ).model_dump()
        )

    return ResponseModel(
        status='ok',
        data=category,
        message='Category found'
    )


@router.post('/', response_model=ResponseModel[CategoryRead], status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    session: AsyncSession = Depends(get_session)
):
    category, created = await create_category_in_db(session, category_data)

    if created:
        return ResponseModel(
            status='ok',
            data=category,
            message='Category created'
        )
    else:
        return ResponseModel(
            status='ok',
            data=category,
            message='Category already exists'
        )


@router.put('/{category_id}', response_model=ResponseModel[CategoryRead])
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    session: AsyncSession = Depends(get_session)
):
    category = await get_category_by_id(session, category_id)
    if not category:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Category not found',
                errors={'code': 404}
            ).model_dump()
        )
    updated_category = await update_category_in_db(session, category, category_data)
    return ResponseModel(
        status='ok',
        data=updated_category,
        message='Category updated'
    )



@router.delete('/{category_id}', response_model=ResponseModel[None])
async def delete_category(category_id: int, session: AsyncSession = Depends(get_session)):
    category = await get_category_by_id(session, category_id)
    if not category:
        return JSONResponse(
            status_code=404,
            content=ResponseModel(
                status='error',
                data=None,
                message='Category not found',
                errors={'code': 404}
            ).model_dump()
        )
    await delete_category_in_db(session, category)
    return ResponseModel(
        status='ok',
        data=None,
        message='Category deleted'
    )