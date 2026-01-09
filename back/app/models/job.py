from datetime import UTC, datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class JobStatus(PyEnum):
    VIEWED = "VIEWED"
    APPLIED = "APPLIED"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(String, nullable=False, index=True)
    job_title = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    status = Column(
        Enum(JobStatus),
        nullable=False,
        default=JobStatus.VIEWED,
        index=True,
    )
    viewed_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    applied_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="jobs")
