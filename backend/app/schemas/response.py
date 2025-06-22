from typing import Generic, TypeVar, Optional, Any
from pydantic.generics import GenericModel

T = TypeVar("T")

class ResponseModel(GenericModel, Generic[T]):
    status: str
    data: Optional[T] = None
    message: Optional[str] = None
    errors: Optional[Any] = None
