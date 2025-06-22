from collections import defaultdict
from datetime import date

from sqlalchemy import func, select, and_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import LeadMetric, Category, Source, Week
from app.schemas.lead_stats import LeadStatsSummary, WeeklyStats


async def get_summary_stats_overview(session: AsyncSession):
    category_summary_result = await session.execute(
        select(
            LeadMetric.category_id,
            Category.name,
            func.sum(LeadMetric.leads_count).label("total_leads"),
            func.sum(LeadMetric.amount).label("total_amount")
        )
        .join(Category, Category.id == LeadMetric.category_id)
        .group_by(LeadMetric.category_id, Category.name)
        .order_by(Category.name)
    )
    category_summary = [
        {
            "category_id": row.category_id,
            "category_name": row.name,
            "total_leads": row.total_leads,
            "total_amount": float(row.total_amount)
        }
        for row in category_summary_result.all()
    ]

    source_summary_result = await session.execute(
        select(
            LeadMetric.source_id,
            Source.name,
            func.sum(LeadMetric.leads_count).label("total_leads"),
            func.sum(LeadMetric.amount).label("total_amount")
        )
        .join(Source, Source.id == LeadMetric.source_id)
        .group_by(LeadMetric.source_id, Source.name)
        .order_by(Source.name)
    )
    source_summary = [
        {
            "source_id": row.source_id,
            "source_name": row.name,
            "total_leads": row.total_leads,
            "total_amount": float(row.total_amount)
        }
        for row in source_summary_result.all()
    ]

    return {
        "by_category": category_summary,
        "by_source": source_summary
    }


def format_date(date_obj):
    return date_obj.strftime('%d.%m.%Y')


async def get_stats_by_category(
    session: AsyncSession,
    category_id: int,
    from_date: date | None = None,
    to_date: date | None = None
) -> LeadStatsSummary:

    conditions = [LeadMetric.category_id == category_id]

    if from_date:
        conditions.append(Week.start_date >= from_date)
    if to_date:
        conditions.append(Week.end_date <= to_date)

    stmt = (
        select(
            Week.id,
            Week.start_date,
            Week.end_date,
            func.sum(LeadMetric.amount).label("amount"),
            func.sum(LeadMetric.leads_count).label("leads_count")
        )
        .join(Week, LeadMetric.week_id == Week.id)
        .where(and_(*conditions))
        .group_by(Week.id, Week.start_date, Week.end_date)
        .order_by(Week.start_date)
    )

    result = await session.execute(stmt)
    rows = result.all()

    weekly_stats = [
        WeeklyStats(
            id=week_id,
            lead_metric_id=None,
            source_id=None,
            category_id=category_id,
            start_date=format_date(start),
            end_date=format_date(end),
            amount=amount or 0,
            leads_count=leads or 0,
            lead_cost=round((amount or 0) / leads, 2) if leads else None
        )
        for week_id, start, end, amount, leads in rows
    ]

    total_amount = sum(ws.amount for ws in weekly_stats)
    total_leads = sum(ws.leads_count for ws in weekly_stats)
    lead_cost = round(total_amount / total_leads, 2) if total_leads > 0 else None

    return LeadStatsSummary(
        total_leads=total_leads,
        total_amount=total_amount,
        lead_cost=lead_cost,
        weekly_stats=weekly_stats
    )

async def get_stats_by_source(
    session: AsyncSession,
    source_id: int,
    from_date: date | None = None,
    to_date: date | None = None
) -> LeadStatsSummary:

    conditions = [LeadMetric.source_id == source_id]

    if from_date:
        conditions.append(Week.start_date >= from_date)
    if to_date:
        conditions.append(Week.end_date <= to_date)

    stmt = (
        select(
            Week.id,
            Week.start_date,
            Week.end_date,
            func.sum(LeadMetric.amount).label("amount"),
            func.sum(LeadMetric.leads_count).label("leads_count")
        )
        .join(Week, LeadMetric.week_id == Week.id)
        .where(and_(*conditions))
        .group_by(Week.id, Week.start_date, Week.end_date)
        .order_by(Week.start_date)
    )

    result = await session.execute(stmt)
    rows = result.all()

    weekly_stats = [
        WeeklyStats(
            id=week_id,
            lead_metric_id=None,
            source_id=source_id,
            category_id=None,
            start_date=format_date(start),
            end_date=format_date(end),
            amount=amount or 0,
            leads_count=leads or 0,
            lead_cost=round((amount or 0) / leads, 2) if leads else None
        )
        for week_id, start, end, amount, leads in rows
    ]

    for row in rows:
        print('ROW:', row, flush=True)

    total_amount = sum(ws.amount for ws in weekly_stats)
    total_leads = sum(ws.leads_count for ws in weekly_stats)

    lead_cost = round(total_amount / total_leads, 2) if total_leads > 0 else None

    return LeadStatsSummary(
        total_leads=total_leads,
        total_amount=total_amount,
        lead_cost=lead_cost,
        weekly_stats=weekly_stats
    )



async def get_lead_metrics_by_weeks(session: AsyncSession):
    stmt = select(LeadMetric).options(
        joinedload(LeadMetric.week),
        joinedload(LeadMetric.category),
        joinedload(LeadMetric.source)
    )
    result = await session.execute(stmt)
    lead_metrics = result.scalars().all()

    week_dict = defaultdict(list)

    for metric in lead_metrics:
        week_key = (metric.week.start_date, metric.week.end_date)
        week_dict[week_key].append({
            "lead_metric_id": metric.id,
            "amount": metric.amount,
            "leads_count": metric.leads_count,
            "category": {
                "id": metric.category.id,
                "name": metric.category.name
            },
            "source": {
                "id": metric.source.id,
                "name": metric.source.name
            },
            "week": {
                "id": metric.week.id,
                "start_date": metric.week.start_date.isoformat(),
                "end_date": metric.week.end_date.isoformat()
            }
        })

    return [
        {
            "start_date": start,
            "end_date": end,
            "metrics": metrics
        }
        for (start, end), metrics in sorted(week_dict.items())
    ]