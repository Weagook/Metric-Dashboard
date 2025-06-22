from pydantic import BaseModel
from typing import List, Optional

class WeeklyStats(BaseModel):
    id: int
    lead_metric_id: Optional[int] = None
    source_id: Optional[int] = None
    category_id: Optional[int] = None
    start_date: str
    end_date: str
    leads_count: int
    amount: int
    lead_cost: float | None = None

class LeadStatsSummary(BaseModel):
    total_leads: int
    total_amount: int
    lead_cost: Optional[float] = None
    weekly_stats: List[WeeklyStats]

    