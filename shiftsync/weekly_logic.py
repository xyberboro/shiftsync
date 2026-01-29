from logic import calculate_day_plan


def calculate_weekly_plan(weekly_schedule):
    results = []

    for day in weekly_schedule.days:
        day_plan = calculate_day_plan(
            day_data=day,
            sleep_hours=weekly_schedule.sleep_hours
        )
        results.append(day_plan)

    return results
