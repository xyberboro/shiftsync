from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class WeeklySchedule(Base):
    __tablename__ = "weekly_schedules"

    id = Column(Integer, primary_key=True, index=True)
    sleep_hours = Column(Float, default=7.5)

    days = relationship("DailyShift", back_populates="week")


class DailyShift(Base):
    __tablename__ = "daily_shifts"

    id = Column(Integer, primary_key=True, index=True)
    day = Column(String)  # Monday, Tuesday, etc.

    shift_start = Column(String, nullable=True)
    shift_end = Column(String, nullable=True)
    is_off = Column(Boolean, default=False)

    week_id = Column(Integer, ForeignKey("weekly_schedules.id"))
    week = relationship("WeeklySchedule", back_populates="days")
