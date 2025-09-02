const inputBox = document.getElementById("inputBox");
const themeBtn = document.getElementById("theme");
const listContainer = document.getElementById("listContainer");
const itemCount = document.getElementById("itemCount");
const filterAll = document.getElementById("all");
const filterActive = document.getElementById("active");
const filterCompleted = document.getElementById("completed");
const clearAll = document.getElementById("clear");

let tasks = [];
let draggedIndex = null;

// Add task on Enter
inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && inputBox.value.trim()) {
    createTask(inputBox.value.trim());
    inputBox.value = "";
  }
});

// Create new task
function createTask(text, completed = false) {
  tasks.push({ text, completed });
  renderTasks();
  saveData();
}

// Render all tasks
function renderTasks() {
  listContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task";
    if (task.completed) li.classList.add("checked");
    li.draggable = true;

    // Drag events
    li.addEventListener("dragstart", () => {
      draggedIndex = index;
      li.classList.add("dragging");
      setTimeout(() => (li.style.display = "none"), 0);
    });

    li.addEventListener("dragover", (e) => e.preventDefault());

    li.addEventListener("drop", () => {
      const targetIndex = Array.from(listContainer.children).indexOf(li);
      const draggedTask = tasks.splice(draggedIndex, 1)[0];
      tasks.splice(targetIndex, 0, draggedTask);
      renderTasks();
      saveData();
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      li.style.display = "flex";
      draggedIndex = null;
    });

    // Checkbox
    const checkbox = document.createElement("div");
    checkbox.className = "checkbox";
    checkbox.innerHTML = `<img src="images/icon-check.svg" alt="check">`;
    checkbox.addEventListener("click", () => {
      task.completed = !task.completed;
      renderTasks();
      saveData();
    });

    // Task text
    const p = document.createElement("p");
    p.textContent = task.text;

    // Delete button
    const cross = document.createElement("img");
    cross.src = "images/icon-cross.svg";
    cross.alt = "delete";
    cross.className = "cross";
    cross.addEventListener("click", () => {
      tasks.splice(index, 1);
      renderTasks();
      saveData();
    });

    li.appendChild(checkbox);
    li.appendChild(p);
    li.appendChild(cross);
    listContainer.appendChild(li);
  });

  updateCount();
  applyFilter(currentFilter);
}

// Update item count
function updateCount() {
  const activeCount = tasks.filter(t => !t.completed).length;
  itemCount.textContent = activeCount;
}

// Save to localStorage
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
}

// Load from localStorage
function loadData() {
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) tasks = JSON.parse(storedTasks);

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light") {
    document.body.classList.add("light-mode");
    themeBtn.innerHTML = '<img src="images/moon-solid-full.svg" alt="Light Mode">';
  }

  renderTasks();
}

// Theme toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  themeBtn.innerHTML = document.body.classList.contains("light-mode")
    ? '<img src="images/moon-solid-full.svg" alt="Light Mode">'
    : '<img src="images/icon-sun.svg" alt="Dark Mode">';
  saveData();
});

// Filters
let currentFilter = "all";

function applyFilter(type) {
  currentFilter = type;
  document.querySelectorAll(".toggle button").forEach(btn => btn.classList.remove("selected"));
  document.getElementById(type).classList.add("selected");

  const items = listContainer.querySelectorAll("li");
  items.forEach((item, i) => {
    if (type === "all") item.style.display = "flex";
    else if (type === "active") item.style.display = tasks[i].completed ? "none" : "flex";
    else if (type === "completed") item.style.display = tasks[i].completed ? "flex" : "none";
  });
}

filterAll.addEventListener("click", () => applyFilter("all"));
filterActive.addEventListener("click", () => applyFilter("active"));
filterCompleted.addEventListener("click", () => applyFilter("completed"));

// Clear completed
clearAll.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  renderTasks();
  saveData();
});

// Initialize app
loadData();