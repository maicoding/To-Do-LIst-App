# To do

A responsive task planner using native HTML, CSS and JavaScript, with no runtime dependencies.

- Create, edit and complete tasks; set priority and due date.
- Search, filter by status and sort by due date or priority.
- Reorder using accessible Up/Down buttons in “My order”.
- Delete or clear completed tasks; undo the last change.
- Save tasks locally, with visible feedback if browser storage is unavailable.

## Run

Serve the repository with any static server, for example `python3 -m http.server 8000`, and open `http://localhost:8000`. No build step is required.

## Data

Tasks are stored only in this browser under `todo.tasks.v1`. Clearing site data removes the list. Tasks from the original version existed only in page memory and cannot be recovered after that page was closed. Text is rendered as text, including HTML-like input. No account, analytics or sync service is connected.

## Validation

Browser-tested add/edit/complete/delete, status and search controls, reorder, clear/undo, reload persistence, malformed storage, blocked storage and HTML-like input. Layout checked at 1440px and 390px. Full WCAG conformance and cross-browser support are not certified.
