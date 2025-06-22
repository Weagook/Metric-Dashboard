from typing import List
from datetime import date

from pydantic import BaseModel

class WeekSchema(BaseModel):
    id: int
    start_date: str
    end_date: str

class CategorySchema(BaseModel):
    id: int
    name: str

class SourceSchema(BaseModel):
    id: int
    name: str

class LeadMetricItemSchema(BaseModel):
    lead_metric_id: int
    amount: int
    leads_count: int
    category: CategorySchema
    source: SourceSchema
    week: WeekSchema

class LeadMetricGroupedByWeekSchema(BaseModel):
    start_date: date
    end_date: date
    metrics: List[LeadMetricItemSchema]
