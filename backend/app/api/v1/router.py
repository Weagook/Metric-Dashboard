from fastapi import APIRouter
from . import categories
from . import lead_metrics
from . import sources
from . import weeks
from . import dashboard

router = APIRouter(prefix='/api/v1')

router.include_router(categories.router)
router.include_router(lead_metrics.router)
router.include_router(sources.router)
router.include_router(dashboard.router)
router.include_router(weeks.router)