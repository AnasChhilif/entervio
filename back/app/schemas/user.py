from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str | None = None
    # website moved to Resume schema


class UserUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1)
    last_name: str | None = Field(None, min_length=1)
    phone: str | None = None
    # website moved to Resume schema


class UserDetailed(UserBase):
    id: int
    has_resume: bool

    class Config:
        from_attributes = True
