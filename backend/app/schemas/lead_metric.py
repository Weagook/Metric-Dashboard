from pydantic import BaseModel


class LeadMetricRead(BaseModel):
    id: int
    amount: int
    leads_count: int
    category_id: int
    source_id: int
    week_id: int

    class Config:
        from_attributes = True


class LeadMetricUpdate(BaseModel):
    amount: int
    leads_count: int
    category_id: int
    source_id: int
    week_id: int


class LeadMetricCreate(BaseModel):
    amount: int
    leads_count: int
    category_id: int
    source_id: int
    week_id: int


class CategoryInWeekAndSource(BaseModel):
    id: int
    name: str


class CategoriesInWeekAndSourceResponse(BaseModel):
    status: str = "ok"
    data: list[CategoryInWeekAndSource]
    message: str = "Categories in week and source"
    errors: None | str = None