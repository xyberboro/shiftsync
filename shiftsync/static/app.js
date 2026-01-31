/* ======================
   GLOBAL STATE
====================== */

const content = document.getElementById("content");

let mode = null;

/* ======================
   HELPERS
====================== */

function clearContent() {
  content.innerHTML = "";
}

function modeHeader(title) {
  return `<div class="section"><h2>${title}</h2></div>`;
}

/* ======================
   MODE SWITCHER
====================== */

function setMode(newMode) {
  mode = newMode;
  clearContent();

  if (mode === "load") renderLoad();
  if (mode === "add") renderAdd();
  if (mode === "edit") renderEdit();
  if (mode === "delete") renderDelete();
}

/* ======================
   LOAD SCHEDULE
====================== */

function renderLoad() {
  content.innerHTML = `
    ${modeHeader("Load Schedule")}

    <div class="section">
      <input id="weekId" placeholder="Enter Week ID">
      <br><br>
      <button class="primary" onclick="loadSchedule()">Load</button>
    </div>

    <div id="calendar" class="calendar"></div>
  `;
}

async function loadSchedule() {
  const weekId = document.getElementById("weekId").value;
  if (!weekId) {
    alert("Enter Week ID");
    return;
  }

  // 1️⃣ Fetch sleep plan
  const planRes = await fetch(`/weekly-plan/${weekId}`);
  if (!planRes.ok) {
    alert("Week not found");
    return;
  }
  const planData = await planRes.json();
  if (planData.error) {
  document.getElementById("calendar").innerHTML =
    `<div class="error">Week ${weekId} does not exist</div>`;
  return;
}


  // 2️⃣ Fetch raw work schedule
  const scheduleRes = await fetch(`/weekly-schedule/${weekId}`);
  const scheduleData = await scheduleRes.json();

  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  planData.forEach(day => {
    const div = document.createElement("div");
    div.className = "calendar-day";

    // Find matching shift data
    const shift = scheduleData.days.find(d => d.day === day.day);

    if (day.status === "Off day" || shift?.is_off) {
      div.classList.add("off");
      div.innerHTML = `
        <h4>${day.day}</h4>
        <div class="calendar-time">Off day</div>
      `;
    } else {
      const sleep = day.plan.sleep;

      div.innerHTML = `
        <h4>${day.day}</h4>

        <div class="calendar-time">
          <strong>Sleep</strong><br>
          ${sleep.sleep_start.slice(11,16)} – ${sleep.wake_time.slice(11,16)}
        </div>

        <div class="calendar-time" style="margin-top:8px">
          <strong>Work</strong><br>
          ${shift.shift_start} – ${shift.shift_end}
        </div>
      `;
    }

    calendar.appendChild(div);
  });
}


/* ======================
   ADD SCHEDULE
====================== */

function renderAdd() {
  content.innerHTML = `
    ${modeHeader("Add Schedule")}

    <div class="section">
      <label>Week ID</label><br>
      <input id="newWeekId" disabled>
      <br><br>

      <label>Sleep Hours</label><br>
      <input id="sleepHours" placeholder="e.g. 7.5">
    </div>

    <div class="section">
      <h3>Weekly Shifts</h3>
      <div class="week-grid">
        ${renderDayInput("Monday")}
        ${renderDayInput("Tuesday")}
        ${renderDayInput("Wednesday")}
        ${renderDayInput("Thursday")}
        ${renderDayInput("Friday")}
        ${renderDayInput("Saturday")}
        ${renderDayInput("Sunday")}
      </div>

      <br>
      <button class="primary" onclick="createSchedule()">Create Schedule</button>
      <div id="addResult"></div>
    </div>
  `;

  autoFillNextWeekId();
}


function renderDayInput(day) {
  const id = day.slice(0,3).toLowerCase();
  return `
    <div class="day-card">
      <strong>${day}</strong><br><br>
      Start:
      <input id="${id}Start" placeholder="18:30">
      End:
      <input id="${id}End" placeholder="07:30">
      <label>
        <input type="checkbox" id="${id}Off"> Off
      </label>
    </div>
  `;
}

async function autoFillNextWeekId() {
  const res = await fetch("/weekly-schedule");
  const weeks = await res.json();
  const nextId = weeks.length ? Math.max(...weeks.map(w => w.id)) + 1 : 1;
  document.getElementById("newWeekId").value = nextId;
}

async function createSchedule() {
  const sleep = document.getElementById("sleepHours").value;
  if (!sleep) return alert("Enter sleep hours");

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    .map(day => {
      const id = day.slice(0,3).toLowerCase();
      const off = document.getElementById(id+"Off").checked;
      return {
        day,
        shift_start: off ? null : document.getElementById(id+"Start").value,
        shift_end: off ? null : document.getElementById(id+"End").value,
        is_off: off
      };
    });

  const res = await fetch("/weekly-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sleep_hours: parseFloat(sleep), days })
  });

  document.getElementById("addResult").innerHTML =
    res.ok ? `<div class="success">Schedule created</div>`
           : `<div class="error">Error creating schedule</div>`;
}

/* ======================
   PLACEHOLDERS
====================== */

let editWeekData = null;

function renderEdit() {
  content.innerHTML = `
    ${modeHeader("Edit Schedule")}

    <div class="section">
      <input id="editWeekId" placeholder="Enter Week ID">
      <br><br>
      <button class="primary" onclick="loadScheduleForEdit()">Load</button>
      <div id="editResult"></div>
    </div>

    <div id="editForm"></div>
  `;
}
async function loadScheduleForEdit() {
  const weekId = document.getElementById("editWeekId").value;
  const result = document.getElementById("editResult");
  const form = document.getElementById("editForm");

  result.innerHTML = "";
  form.innerHTML = "";

  if (!weekId) {
    result.innerHTML = `<div class="error">Please enter Week ID</div>`;
    return;
  }

  const res = await fetch(`/weekly-schedule/${weekId}`);
  const data = await res.json();

  if (data.error) {
    result.innerHTML = `<div class="error">Week ${weekId} does not exist</div>`;
    editWeekData = null;
    return;
  }

  editWeekData = data;

  form.innerHTML = `
  <div class="section">
    <h3>Edit Weekly Shifts</h3>
    <div class="week-grid" id="editGrid"></div>
  </div>
`;


  data.days.forEach(day => {
    const id = day.day.slice(0,3).toLowerCase();

    document.getElementById("editGrid").innerHTML += `
      <div class="day-card">
        <strong>${day.day}</strong><br><br>
        Start:
        <input id="edit-${id}-start" value="${day.shift_start || ""}">
        End:
        <input id="edit-${id}-end" value="${day.shift_end || ""}">
        <label>
          <input type="checkbox" id="edit-${id}-off" ${day.is_off ? "checked" : ""}>
          Off
        </label>
      </div>
    `;
  });

  form.innerHTML += `
    <div class="section">
      <button class="primary" onclick="saveEditedSchedule()">Save Changes</button>
    </div>
  `;
}
async function saveEditedSchedule() {
  if (!editWeekData) return;

  const days = editWeekData.days.map(day => {
    const id = day.day.slice(0,3).toLowerCase();
    const off = document.getElementById(`edit-${id}-off`).checked;

    return {
      day: day.day,
      shift_start: off ? null : document.getElementById(`edit-${id}-start`).value,
      shift_end: off ? null : document.getElementById(`edit-${id}-end`).value,
      is_off: off
    };
  });

  const res = await fetch(`/weekly-schedule/${editWeekData.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sleep_hours: editWeekData.sleep_hours,
      days: days
    })
  });

  document.getElementById("editResult").innerHTML =
    res.ok
      ? `<div class="success">Schedule updated successfully</div>`
      : `<div class="error">Failed to update schedule</div>`;
}


function renderDelete() {
  content.innerHTML = `
    ${modeHeader("Delete Schedule")}

    <div class="section">
      <input id="deleteWeekId" placeholder="Enter Week ID">
      <br><br>
      <button class="danger" onclick="deleteSchedule()">Delete</button>
      <div id="deleteResult"></div>
    </div>
  `;
}

async function deleteSchedule() {
  const weekId = document.getElementById("deleteWeekId").value;
  const result = document.getElementById("deleteResult");

  if (!weekId) {
    result.innerHTML = `<div class="error">Please enter Week ID</div>`;
    return;
  }

  // 1️⃣ Check if week exists
  const checkRes = await fetch(`/weekly-schedule/${weekId}`);
  const checkData = await checkRes.json();

  if (checkData.error) {
    result.innerHTML = `<div class="error">Week ${weekId} does not exist</div>`;
    return;
  }

  // 2️⃣ Ask confirmation ONLY if it exists
  const confirmDelete = confirm(
    `Are you sure you want to delete Week ${weekId}?`
  );

  if (!confirmDelete) return;

  // 3️⃣ Proceed with delete
  const res = await fetch(`/weekly-schedule/${weekId}`, {
    method: "DELETE"
  });

  result.innerHTML =
    res.ok
      ? `<div class="success">Week ${weekId} deleted successfully</div>`
      : `<div class="error">Failed to delete Week ${weekId}</div>`;
}

