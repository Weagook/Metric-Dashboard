from typing import Sequence, Tuple

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

async def get_all_categories(session: AsyncSession) -> Sequence[Category]:
    result = await session.execute(select(Category))
    return result.scalars().all()


async def get_category_by_id(session: AsyncSession, category_id: int) -> Category | None:
    result = await session.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def create_category_in_db(session: AsyncSession, category_data: CategoryCreate) -> Tuple[Category, bool]:
    result = await session.execute(
        select(Category).where(Category.name == category_data.name)
    )
    existing_category = result.scalars().first()

    if existing_category:
        return existing_category, False

    new_category = Category(name=category_data.name)
    session.add(new_category)
    await session.commit()
    await session.refresh(new_category)
    return new_category, True


async def update_category_in_db(
    session: AsyncSession,
    category: Category,
    category_data: CategoryUpdate
) -> Category:
    if category_data.name is not None and category_data.name != category.name:
        result = await session.execute(
            select(Category).where(Category.name == category_data.name)
        )
        existing = result.scalars().first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail='Категория с таким именем уже существует'
            )

        category.name = category_data.name

    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category


async def delete_category_in_db(session: AsyncSession, category: Category) -> None:
    await session.delete(category)
    await session.commit()