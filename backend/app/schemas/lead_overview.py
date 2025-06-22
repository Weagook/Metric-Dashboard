from pydantic import BaseModel
from typing import List


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    total_leads: int
    total_amount: float


class SourceSummary(BaseModel):
    source_id: int
    source_name: str
    total_leads: int
    total_amount: float


class LeadOverview(BaseModel):
    by_category: List[CategorySummary]
    by_source: List[SourceSummary]
