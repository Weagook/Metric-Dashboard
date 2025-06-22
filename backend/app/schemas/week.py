from pydantic import BaseModel
from datetime import date

class WeekRead(BaseModel):
    id: int
    start_date: date
    end_date: date

    class Config:
        from_attributes = True


class WeekCreate(BaseModel):
    start_date: date
    end_date: date


class WeekUpdate(BaseModel):
    start_date: date
    end_date: date


class SourceInWeek(BaseModel):
    id: int
    name: str

class SourcesInWeekResponse(BaseModel):
    status: str = "ok"
    data: list[SourceInWeek]
    message: str = "Sources in week"
    errors: None | str = None