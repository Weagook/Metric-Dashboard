from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from sqlalchemy import Enum as SQLEnum

from app.db.base import Base
from app.schemas.enum.lead import LeadPricingType

class Source(Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    pricing_type: Mapped[LeadPricingType] = mapped_column(
        SQLEnum(LeadPricingType, name="lead_pricing_type"),
        default=LeadPricingType.TOTAL_DIVIDED,
        nullable=False
    )
    
    lead_metric: Mapped[list["LeadMetric"]] = relationship("LeadMetric", back_populates="source", cascade="all, delete") # type: ignore
