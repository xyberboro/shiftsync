from weekly_logic import calculate_weekly_plan
from models import WeeklySchedule

from fastapi import FastAPI, Depends, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from database import SessionLocal
from logic import calculate_shift_plan
from crud import create_weekly_schedule, get_weekly_schedules

from crud import (
    create_weekly_schedule,
    get_weekly_schedules,
    delete_weekly_schedule,
    update_weekly_schedule
)


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/", response_class=HTMLResponse)
def frontend():
    with open("static/index.html") as f:
        return f.read()


@app.post("/weekly-schedule")
def save_weekly_schedule(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    sleep_hours = payload["sleep_hours"]
    days = payload["days"]
    return create_weekly_schedule(db, sleep_hours, days)


@app.get("/weekly-schedule")
def list_weekly_schedules(db: Session = Depends(get_db)):
    return get_weekly_schedules(db)

@app.get("/weekly-schedule/{week_id}")
def get_single_weekly_schedule(
    week_id: int,
    db: Session = Depends(get_db)
):
    week = db.query(WeeklySchedule).filter(
        WeeklySchedule.id == week_id
    ).first()

    if not week:
        return {"error": "Week not found"}

    return {
        "id": week.id,
        "sleep_hours": week.sleep_hours,
        "days": [
            {
                "day": d.day,
                "shift_start": d.shift_start,
                "shift_end": d.shift_end,
                "is_off": d.is_off
            }
            for d in week.days
        ]
    }


@app.get("/weekly-plan/{week_id}")
def get_weekly_plan(
    week_id: int,
    db: Session = Depends(get_db)
):
    week = db.query(WeeklySchedule).filter(
        WeeklySchedule.id == week_id
    ).first()

    if not week:
        return {"error": "Weekly schedule not found"}

    return calculate_weekly_plan(week)

@app.delete("/weekly-schedule/{week_id}")
def remove_weekly_schedule(
    week_id: int,
    db: Session = Depends(get_db)
):
    deleted = delete_weekly_schedule(db, week_id)

    if not deleted:
        return {"error": "Weekly schedule not found"}

    return {"message": "Weekly schedule deleted successfully"}

@app.put("/weekly-schedule/{week_id}")
def edit_weekly_schedule(
    week_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    updated = update_weekly_schedule(
        db,
        week_id,
        payload["sleep_hours"],
        payload["days"]
    )

    if not updated:
        return {"error": "Weekly schedule not found"}

    return {"message": "Weekly schedule updated successfully"}
