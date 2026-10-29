(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const key = "todo.tasks.v1";
  let tasks = [],
    previous = null,
    filter = "all",
    editing = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(saved))
      tasks = saved
        .filter(
          (t) => t && typeof t.id === "string" && typeof t.text === "string",
        )
        .map((t) => ({
          id: t.id,
          text: t.text.slice(0, 200),
          done: !!t.done,
          priority: ["high", "normal", "low"].includes(t.priority)
            ? t.priority
            : "normal",
          due: /^\d{4}-\d{2}-\d{2}$/.test(t.due) ? t.due : "",
        }));
  } catch {
    $("notice").textContent =
      "Saved tasks could not be read. You can start a new list.";
  }
  function save(message) {
    try {
      localStorage.setItem(key, JSON.stringify(tasks));
      $("notice").textContent = message;
    } catch {
      $("notice").textContent =
        "Browser storage is unavailable. Changes will last until you close this page.";
    }
    render();
  }
  function change(fn, message) {
    previous = structuredClone(tasks);
    fn();
    save(message);
  }
  function button(text, label, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.setAttribute("aria-label", label);
    b.onclick = fn;
    return b;
  }
  function render() {
    const focusLabel = $("list").contains(document.activeElement) ? document.activeElement.getAttribute("aria-label") : null;
    const active = tasks.filter((t) => !t.done).length,
      done = tasks.length - active;
    $("count").textContent = `${done} of ${tasks.length} completed`;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    document
      .querySelector(".progress-track")
      .setAttribute("aria-valuenow", percent);
    document.querySelector(".progress-fill").style.width = percent + "%";
    let visible = tasks.filter(
      (t) =>
        (filter === "all" || (filter === "done" ? t.done : !t.done)) &&
        t.text.toLowerCase().includes($("search").value.trim().toLowerCase()),
    );
    const sort = $("sort").value;
    if (sort === "due")
      visible.sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    if (sort === "priority") {
      const rank = { high: 0, normal: 1, low: 2 };
      visible.sort((a, b) => rank[a.priority] - rank[b.priority]);
    }
    $("list").replaceChildren();
    for (const t of visible) {
      const li = document.createElement("li");
      li.dataset.id = t.id;
      li.className = "task" + (t.done ? " done" : "");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = t.done;
      check.setAttribute("aria-label", "Complete " + t.text);
      check.onchange = () =>
        change(() => {
          t.done = check.checked;
        }, "Task updated.");
      const body = document.createElement("div");
      body.className = "task-body";
      const title = document.createElement("p");
      title.className = "task-title";
      title.textContent = t.text;
      const meta = document.createElement("span");
      meta.className = "task-meta";
      meta.textContent =
        t.priority + " priority" + (t.due ? " · Due " + t.due : "");
      body.append(title, meta);
      const actions = document.createElement("div");
      actions.className = "task-controls";
      actions.append(
        button("Edit", "Edit " + t.text, () => {
          editing = t.id;
          $("edit-text").value = t.text;
          $("edit-priority").value = t.priority;
          $("edit-due").value = t.due;
          $("edit-dialog").showModal();
        }),
        button("Delete", "Delete " + t.text, () =>
          change(() => {
            tasks = tasks.filter((x) => x.id !== t.id);
          }, "Task deleted. Undo is available."),
        ),
      );
      for (const [delta, label] of [
        [-1, "Up"],
        [1, "Down"],
      ]) {
        const b = button(
          label,
          "Move " + t.text + " " + label.toLowerCase(),
          () =>
            change(() => {
              const i = tasks.indexOf(t);
              [tasks[i], tasks[i + delta]] = [tasks[i + delta], tasks[i]];
            }, "Task moved."),
        );
        b.disabled =
          sort !== "manual" ||
          tasks.indexOf(t) + delta < 0 ||
          tasks.indexOf(t) + delta >= tasks.length;
        actions.append(b);
      }
      li.append(check, body, actions);
      $("list").append(li);
    }
    if (focusLabel) {
      const replacement = [...$("list").querySelectorAll("[aria-label]")].find(el => el.getAttribute("aria-label") === focusLabel && !el.disabled);
      (replacement || $("list").querySelector("input") || $("input")).focus();
    }
    $("empty").hidden = visible.length > 0;
    $("empty").textContent = tasks.length
      ? "No tasks match this view."
      : "Your list is clear. Add your first task above.";
    $("undo").hidden = !previous;
    $("clear").disabled = !done;
    document
      .querySelectorAll("[data-filter]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.filter === filter),
      );
  }
  $("add-form").onsubmit = (e) => {
    e.preventDefault();
    const text = $("input").value.trim();
    if (!text) {
      $("input").setCustomValidity("Enter a task.");
      $("input").reportValidity();
      return;
    }
    change(
      () =>
        tasks.push({
          id: crypto.randomUUID(),
          text,
          done: false,
          priority: $("priority").value,
          due: $("due").value,
        }),
      "Task added.",
    );
    $("input").value = "";
    $("input").focus();
  };
  $("input").oninput = () => $("input").setCustomValidity("");
  $("search").oninput = render;
  $("sort").onchange = render;
  document.querySelectorAll("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        render();
      }),
  );
  $("clear").onclick = () =>
    change(() => {
      tasks = tasks.filter((t) => !t.done);
    }, "Completed tasks cleared. Undo is available.");
  $("undo").onclick = () => {
    tasks = previous;
    previous = null;
    save("Last change undone.");
  };
  $("edit-form").onsubmit = (e) => {
    e.preventDefault();
    const text = $("edit-text").value.trim();
    if (!text) {
      $("edit-text").setCustomValidity("Enter a task.");
      $("edit-text").reportValidity();
      return;
    }
    change(() => {
      const t = tasks.find((t) => t.id === editing);
      if (t)
        Object.assign(t, {
          text,
          priority: $("edit-priority").value,
          due: $("edit-due").value,
        });
    }, "Task saved.");
    $("edit-dialog").close();
  };
  $("edit-text").oninput = () => $("edit-text").setCustomValidity("");
  $("edit-dialog").addEventListener("close", () => {
    const row = [...$("list").children].find(el => el.dataset.id === editing);
    (row?.querySelector("button") || $("input")).focus();
  });
  $("close-edit").onclick = () => $("edit-dialog").close();
  render();
})();
