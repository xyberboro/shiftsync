from sqlalchemy.orm import Session
from models import WeeklySchedule, DailyShift


def create_weekly_schedule(db: Session, sleep_hours: float, days: list):
    week = WeeklySchedule(sleep_hours=sleep_hours)
    db.add(week)
    db.commit()
    db.refresh(week)

    for day in days:
        daily = DailyShift(
            day=day["day"],
            shift_start=day.get("shift_start"),
            shift_end=day.get("shift_end"),
            is_off=day.get("is_off", False),
            week_id=week.id
        )
        db.add(daily)

    db.commit()
    return week


def get_weekly_schedules(db: Session):
    return db.query(WeeklySchedule).all()


def delete_weekly_schedule(db: Session, week_id: int):
    week = db.query(WeeklySchedule).filter(
        WeeklySchedule.id == week_id
    ).first()

    if not week:
        return None

    db.delete(week)
    db.commit()
    return week

def update_weekly_schedule(db: Session, week_id: int, sleep_hours: float, days: list):
    week = db.query(WeeklySchedule).filter(
        WeeklySchedule.id == week_id
    ).first()

    if not week:
        return None

    # Update sleep hours
    week.sleep_hours = sleep_hours

    # Delete old days
    db.query(DailyShift).filter(
        DailyShift.week_id == week_id
    ).delete()

    # Add new days
    for day in days:
        new_day = DailyShift(
            day=day["day"],
            shift_start=day.get("shift_start"),
            shift_end=day.get("shift_end"),
            is_off=day.get("is_off", False),
            week_id=week.id
        )
        db.add(new_day)

    db.commit()
    return week
