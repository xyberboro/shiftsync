# ShiftSync – Work & Sleep Schedule Planner

ShiftSync is a full-stack web application that helps night-shift and rotating-shift workers plan their **weekly work schedules** and automatically visualize **sleep windows** based on shift timings.

The app focuses on clarity, correctness, and real-world usability — separating **editable work shifts** from **derived sleep schedules** and presenting them in a clean calendar view.

🔗 **Live Demo:** https://shiftsync-mr14.onrender.com

---

## 🚀 Key Features

- Weekly schedule management (Monday–Sunday)
- Auto-generated Week IDs
- Per-week sleep duration configuration
- Day-level Off marking
- Automatic sleep window calculation
- Read-only calendar view (Sleep + Work)
- Edit & delete schedules safely
- Responsive dark-mode UI
- Deployed production backend

---

## 🧠 Design Highlights

- Separation of concerns between editable data and derived data
- Defensive UX with clear error and confirmation messages
- Distinct Add / Load / Edit / Delete modes
- No frontend frameworks (vanilla JavaScript)

---

## 🛠️ Tech Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy
- SQLite

**Frontend**
- HTML
- CSS
- Vanilla JavaScript

**Deployment**
- Render (Python Web Service)

---

## 📁 Project Structure

shiftsync/
├── main.py
├── logic.py
├── requirements.txt
├── database.db
├── static/
│ ├── index.html
│ └── app.js


---

## ▶️ Run Locally


---

## ▶️ Run Locally

  bash
  pip install -r requirements.txt
  uvicorn main:app --reload


Open:

  http://127.0.0.1:8000

🌐 Deployment

Deployed on Render as a Python Web Service.

Root Directory: shiftsync

Build Command:

  pip install -r requirements.txt

Start Command:

  uvicorn main:app --host 0.0.0.0 --port 10000

📌 Scheduling Logic

  Work shifts define unavailable hours

  Sleep windows are automatically calculated

  Sleep data is derived and not directly editable

  Off days override both shift and sleep generation

🔮 Future Enhancements

  Multi-user support

  PostgreSQL database

  Mobile-first UI

  Schedule export (PDF / image)

  Shift overlap validation

👤 Author

  xyber

📄 License

  This project is intended for personal and portfolio use.
