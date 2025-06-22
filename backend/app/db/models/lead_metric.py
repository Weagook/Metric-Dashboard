from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Integer, UniqueConstraint

from app.db.base import Base

class LeadMetric(Base):
    __tablename__ = "lead_metrics"
    __table_args__ = (
        UniqueConstraint("category_id", "source_id", "week_id", name="uq_category_source_week"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    leads_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id"), nullable=False)
    week_id: Mapped[int] = mapped_column(ForeignKey("weeks.id"), nullable=False)

    week: Mapped["Week"] = relationship(back_populates="lead_metric") # type: ignore
    category: Mapped["Category"] = relationship(back_populates="lead_metric") # type: ignore
    source: Mapped["Source"] = relationship(back_populates="lead_metric") # type: ignore
