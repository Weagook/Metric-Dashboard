from enum import Enum

class LeadPricingType(str, Enum):
    FIXED_PER_LEAD = "fixed_per_lead"
    TOTAL_DIVIDED = "total_divided"