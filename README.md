# Tymora Calender

A simple calendar web application built with HTML, CSS, JavaScript and JSON.

## Features (MVP)

- Monthly calendar view with previous / next month navigation
- Highlight current day
- Mark days that have events
- Add new events (title, date, start/end time, category, notes)
- Edit existing events
- Delete events (with confirmation)
- Data is saved in the browser using localStorage + JSON
- Form validation (title and date required, end time must be after start time)
- Responsive layout

## Project Structure

calender/
├── index.html
├── styles.css
├── app.js
├── sample-events.json
└── README.md
text


## How to Run

1. Open the `calender` folder in Visual Studio Code
2. Right-click `index.html` → Reveal in File Explorer or Start the debugging if you use visual studio
3. Double-click `index.html` to open it in your browser

Or use Live Server if you have the extension.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- JSON + localStorage

## Data Format

Events are stored as JSON objects like this:

```json
{
  "id": "evt-001",
  "title": "Azure study session",
  "date": "2026-10-21",
  "startTime": "18:00",
  "endTime": "19:00",
  "category": "Study",
  "notes": "Revise ARM templates",
  "allDay": false
}