from sqlalchemy import Date, Computed, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from datetime import date

from app.db.base import Base


class Week(Base):
    __tablename__ = "weeks"

    id: Mapped[int] = mapped_column(primary_key=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    lead_metric: Mapped[list["LeadMetric"]] = relationship(
        "LeadMetric",
        back_populates="week",
        cascade="all, delete"  # Добавить каскадное удаление
    ) # type: ignore
