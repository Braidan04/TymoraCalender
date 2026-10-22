// ===== Elements =====
const monthYearEl = document.getElementById("current-month-year");
const calendarGrid = document.getElementById("calendar-grid");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
const eventForm = document.getElementById("event-form");
const formTitle = document.getElementById("form-title");
const titleInput = document.getElementById("event-title");
const dateInput = document.getElementById("event-date");
const startInput = document.getElementById("event-start");
const endInput = document.getElementById("event-end");
const categoryInput = document.getElementById("event-category");
const notesInput = document.getElementById("event-notes");
const eventsList = document.getElementById("events-list");
const selectedDateLabel = document.getElementById("selected-date-label");
const saveBtn = eventForm.querySelector("button[type='submit']");

// Settings elements
const settingsPanel = document.getElementById("settings-panel");
const btnSettings = document.getElementById("btn-settings");
const closeSettings = document.getElementById("close-settings");
const settingsContent = document.getElementById("settings-content");

// ===== State =====
let currentDate = new Date();
let selectedDate = null;
let events = [];
let editingId = null; // null = adding new, otherwise editing

// ===== Helpers =====
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateId() {
  return "evt-" + Date.now();
}

// ===== Load & Save =====
function loadEvents() {
  const saved = localStorage.getItem("calendar-events");
  events = saved ? JSON.parse(saved) : [];
}

function saveEvents() {
  localStorage.setItem("calendar-events", JSON.stringify(events));
}

// ===== Reset Form to "Add" mode =====
function resetForm() {
  editingId = null;
  formTitle.textContent = "Add Event";
  saveBtn.textContent = "Save Event";
  eventForm.reset();
  if (selectedDate) {
    dateInput.value = selectedDate;
  }
}

// ===== Render Events List =====
function renderEventsList() {
  if (!selectedDate) {
    selectedDateLabel.textContent = "this day";
    eventsList.innerHTML = `<li class="empty">Click a day to see events</li>`;
    return;
  }

  const niceDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
  selectedDateLabel.textContent = niceDate;

  const dayEvents = events.filter(ev => ev.date === selectedDate);

  if (dayEvents.length === 0) {
    eventsList.innerHTML = `<li class="empty">No events on this day</li>`;
    return;
  }

  eventsList.innerHTML = dayEvents.map(ev => {
    const time = ev.startTime ? `${ev.startTime}${ev.endTime ? " - " + ev.endTime : ""}` : "All day";
    return `
      <li class="event-item">
        <div class="event-info">
          <strong>${ev.title}</strong>
          <div class="event-time">${time}</div>
          ${ev.category ? `<span class="event-category">${ev.category}</span>` : ""}
        </div>
        <div>
          <button class="edit-btn" data-id="${ev.id}">Edit</button>
          <button class="delete-btn" data-id="${ev.id}">Delete</button>
        </div>
      </li>
    `;
  }).join("");

  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const ev = events.find(e => e.id === id);
      if (!ev) return;

      editingId = id;
      formTitle.textContent = "Edit Event";
      saveBtn.textContent = "Update Event";

      titleInput.value = ev.title;
      dateInput.value = ev.date;
      startInput.value = ev.startTime || "";
      endInput.value = ev.endTime || "";
      categoryInput.value = ev.category || "";
      notesInput.value = ev.notes || "";
    });
  });

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      if (confirm("Delete this event?")) {
        events = events.filter(ev => ev.id !== id);
        saveEvents();
        renderCalendar();
        renderEventsList();
        if (editingId === id) resetForm();
      }
    });
  });
}

// ===== Render Calendar =====
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  monthYearEl.textContent = monthName + " " + year;

  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = formatDate(new Date());

  // Empty cells
  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendarGrid.appendChild(empty);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement("div");
    dayCell.className = "day";
    dayCell.textContent = day;

    const thisDate = formatDate(new Date(year, month, day));

    if (thisDate === todayStr) dayCell.classList.add("today");
    if (thisDate === selectedDate) dayCell.classList.add("selected");

    const hasEvents = events.some(ev => ev.date === thisDate);
    if (hasEvents) dayCell.classList.add("has-event");

    dayCell.addEventListener("click", function () {
      selectedDate = thisDate;
      dateInput.value = thisDate;
      renderCalendar();
      renderEventsList();
    });

    calendarGrid.appendChild(dayCell);
  }
}

// ===== Form Submit (Add or Update) =====
eventForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const date = dateInput.value;

  if (!title || !date) {
    alert("Title and Date are required");
    return;
  }

  // Validation from the PDF
  const start = startInput.value;
  const end = endInput.value;

  if (start && end && end <= start) {
    alert("End time must be after start time");
    return;
  }

  if (editingId) {
    // Update existing event
    const index = events.findIndex(ev => ev.id === editingId);
    if (index !== -1) {
      events[index] = {
        id: editingId,
        title: title,
        date: date,
        startTime: startInput.value || null,
        endTime: endInput.value || null,
        category: categoryInput.value || null,
        notes: notesInput.value.trim() || null
      };
    }
  } else {
    // Add new event
    events.push({
      id: generateId(),
      title: title,
      date: date,
      startTime: startInput.value || null,
      endTime: endInput.value || null,
      category: categoryInput.value || null,
      notes: notesInput.value.trim() || null
    });
  }

  saveEvents();
  renderCalendar();
  renderEventsList();
  resetForm();
});

// ===== Navigation =====
prevBtn.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// ===== Settings Panel =====
btnSettings.addEventListener("click", function () {
  settingsPanel.classList.remove("hidden");
});

closeSettings.addEventListener("click", function () {
  settingsPanel.classList.add("hidden");
});

// ===== Settings Menu =====
document.querySelectorAll(".settings-menu li").forEach(item => {
  item.addEventListener("click", function () {
    const section = this.getAttribute("data-section");
    let content = "";

    switch (section) {

      case "calendar-settings":
        content = `
          <h3>Calendar settings</h3>
          <p><strong>Week starts on:</strong> Sunday</p>
          <p><strong>Default view:</strong> Month</p>
          <p><strong>Show week numbers:</strong> Off</p>
          <p style="margin-top:12px;color:#888;">More options coming soon.</p>
        `;
        break;

      case "appearance":
        content = `
          <h3>Appearance & themes</h3>
          <p>Choose a theme:</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
            <button class="theme-btn" data-theme="cream">Cream + Dark Brown + Orange (Current)</button>
            <button class="theme-btn" data-theme="dark">Dark Mode</button>
            <button class="theme-btn" data-theme="blue">Blue Professional</button>
          </div>
        `;
        break;

      case "manage":
        content = `
          <h3>Manage calendars</h3>
          <p>You currently have <strong>1 calendar</strong> (Personal).</p>
          <p style="margin-top:10px;color:#888;">Multiple calendars coming in a future update.</p>
        `;
        break;

      case "import-export":
        content = `
          <h3>Import & export</h3>
          <p>Export all your events as a JSON file, or load the sample data.</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
            <button id="export-btn" class="settings-action-btn">Export Events (JSON)</button>
            <button id="import-sample-btn" class="settings-action-btn">Load Sample Events</button>
          </div>
        `;
        break;

      case "notifications":
        content = `
          <h3>Notifications</h3>
          <p>Browser notifications are currently <strong>disabled</strong>.</p>
          <p style="margin-top:10px;color:#888;">This feature will be added later.</p>
        `;
        break;

      case "privacy":
        content = `
          <h3>Privacy & security</h3>
          <p>All your data is stored only in this browser using <strong>localStorage</strong>.</p>
          <p>Nothing is sent to any server.</p>
          <div style="margin-top:16px;">
            <button id="clear-data-btn" class="settings-action-btn danger">Clear All Events</button>
          </div>
        `;
        break;

      case "shortcuts":
        content = `
          <h3>Keyboard shortcuts</h3>
          <ul style="margin-top:10px; line-height:1.8;">
            <li><strong>←</strong> Previous month</li>
            <li><strong>→</strong> Next month</li>
          </ul>
          <p style="margin-top:12px;color:#888;">More shortcuts coming soon.</p>
        `;
        break;

      case "help":
        content = `
          <h3>Help & feedback</h3>
          <p><strong>Tymora Calendar</strong></p>
          <p>Built with HTML, CSS, JavaScript and JSON.</p>
          <p style="margin-top:10px;">This is a local calendar. Your data stays in your browser.</p>
        `;
        break;
    }

    settingsContent.innerHTML = content;

    // ===== Activate buttons after content is inserted =====
    activateSettingsButtons();
  });
});

// ===== Activate buttons inside settings =====
function activateSettingsButtons() {
  // Theme buttons
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const theme = this.getAttribute("data-theme");
      applyTheme(theme);
    });
  });

  // Export button
  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportEvents);
  }

  // Import sample button
  const importBtn = document.getElementById("import-sample-btn");
  if (importBtn) {
    importBtn.addEventListener("click", loadSampleEvents);
  }

  // Clear data button
  const clearBtn = document.getElementById("clear-data-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearAllData);
  }
}

// ===== Theme Switcher =====
function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "cream") {
    root.style.setProperty("--cream", "#FDF6E3");
    root.style.setProperty("--cream-dark", "#F5E8C7");
    root.style.setProperty("--dark-brown", "#3E2723");
    root.style.setProperty("--brown", "#5D4037");
    root.style.setProperty("--orange", "#E65100");
    root.style.setProperty("--orange-light", "#FF8A65");
    root.style.setProperty("--orange-dark", "#BF360C");
    root.style.setProperty("--text", "#3E2723");
    alert("Cream theme applied!");
  }

  if (theme === "dark") {
    root.style.setProperty("--cream", "#1e1e1e");
    root.style.setProperty("--cream-dark", "#2d2d2d");
    root.style.setProperty("--dark-brown", "#ffffff");
    root.style.setProperty("--brown", "#cccccc");
    root.style.setProperty("--orange", "#ff9800");
    root.style.setProperty("--orange-light", "#ffb74d");
    root.style.setProperty("--orange-dark", "#f57c00");
    root.style.setProperty("--text", "#ffffff");
    alert("Dark theme applied!");
  }

  if (theme === "blue") {
    root.style.setProperty("--cream", "#f0f7ff");
    root.style.setProperty("--cream-dark", "#dbeafe");
    root.style.setProperty("--dark-brown", "#1e3a5f");
    root.style.setProperty("--brown", "#3b82f6");
    root.style.setProperty("--orange", "#2563eb");
    root.style.setProperty("--orange-light", "#60a5fa");
    root.style.setProperty("--orange-dark", "#1d4ed8");
    root.style.setProperty("--text", "#1e3a5f");
    alert("Blue theme applied!");
  }
}

// ===== Export Events =====
function exportEvents() {
  const dataStr = JSON.stringify({ events: events }, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tymora-calendar-events.json";
  a.click();

  URL.revokeObjectURL(url);
  alert("Events exported successfully!");
}

// ===== Load Sample Events =====
function loadSampleEvents() {
  if (!confirm("This will add the sample events. Continue?")) return;

  const sample = [
    {
      id: "evt-001",
      title: "Azure study session",
      date: "2026-10-21",
      startTime: "18:00",
      endTime: "19:00",
      category: "Study",
      notes: "Revise ARM templates"
    },
    {
      id: "evt-002",
      title: "Team standup",
      date: "2026-10-22",
      startTime: "09:30",
      endTime: "10:00",
      category: "Meeting",
      notes: null
    },
    {
      id: "evt-003",
      title: "Project planning day",
      date: "2026-10-25",
      startTime: null,
      endTime: null,
      category: "Work",
      notes: "Focus time – no meetings"
    }
  ];

  events = events.concat(sample);
  saveEvents();
  renderCalendar();
  renderEventsList();
  alert("Sample events loaded!");
}

// ===== Clear All Data =====
function clearAllData() {
  if (!confirm("Are you sure you want to delete ALL events? This cannot be undone.")) return;

  events = [];
  localStorage.removeItem("calendar-events");
  renderCalendar();
  renderEventsList();
  alert("All events have been cleared.");
}

// ===== Start =====
loadEvents();
renderCalendar();
renderEventsList();