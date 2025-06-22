from pydantic import BaseModel

class SourceRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class SourceCreate(BaseModel):
    name: str


class SourceUpdate(BaseModel):
    name: str