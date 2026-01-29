from datetime import datetime, timedelta


from datetime import datetime, timedelta

def calculate_shift_plan(shift_start, shift_end, sleep_hours, day_start):
    fmt = "%H:%M"

    shift_start_time = datetime.strptime(shift_start, fmt).time()
    shift_end_time = datetime.strptime(shift_end, fmt).time()

    start = datetime.combine(day_start.date(), shift_start_time)
    end = datetime.combine(day_start.date(), shift_end_time)

    # Overnight shift
    if end <= start:
        end += timedelta(days=1)

    sleep_start = end + timedelta(minutes=30)
    sleep_end = sleep_start + timedelta(hours=sleep_hours)

    return {
        "sleep": {
            "sleep_start": sleep_start.isoformat(),
            "wake_time": sleep_end.isoformat()
        }
    }


from datetime import datetime, timedelta

WEEK_DAYS = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday", "Sunday"
]

def calculate_day_plan(day_data, sleep_hours):
    if day_data.is_off:
        return {
            "day": day_data.day,
            "status": "Off day"
        }

    if not day_data.shift_start or not day_data.shift_end:
        return {
            "day": day_data.day,
            "status": "Off day"
        }

    # 🔑 Anchor each day to a real date
    base_date = datetime(2024, 1, 1)  # arbitrary stable Monday
    day_offset = WEEK_DAYS.index(day_data.day)
    day_start = base_date + timedelta(days=day_offset)

    return {
        "day": day_data.day,
        "plan": calculate_shift_plan(
            day_data.shift_start,
            day_data.shift_end,
            sleep_hours,
            day_start
        )
    }

