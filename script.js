let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTask = null;

const views = document.querySelectorAll(".view");
const taskList = document.getElementById("taskList");

document.querySelectorAll(".sidebar button").forEach(btn => {
    btn.onclick = () => loadView(btn.dataset.view);
});

function loadView(view) {
    // Hide all views
    views.forEach(v => v.classList.remove("active"));

    if (view === "dashboard") {
        dashboard.classList.add("active");
        updateDashboard();
    } else {
        taskPage.classList.add("active");
        renderTasks(view); // 🔥 PASS FILTER TYPE
    }
}


taskForm.onsubmit = e => {
    e.preventDefault();
    tasks.push({
        id: Date.now(),
        title: taskTitle.value,
        due: taskDueDate.value,
        priority: taskPriority.value,
        notes: "",
        completed: false
    });
    save();
    taskForm.reset();
    updateDashboard();
};

function renderTasks(type = "all") {
    taskList.innerHTML = "";

    pageTitle.textContent =
        type === "completed" ? "Completed Tasks" :
            type === "pending" ? "Pending Tasks" :
                "All Tasks";

    let filteredTasks = tasks;

    if (type === "completed") {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (type === "pending") {
        filteredTasks = tasks.filter(t => !t.completed);
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = "<p>No tasks here.</p>";
        return;
    }

    filteredTasks.forEach(task => {
        const div = document.createElement("div");
        div.className = `task ${task.completed ? "completed" : ""}`;

        div.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""}>
      <div class="task-body">
        <strong>${task.title}</strong><br>
        <small>Due: ${task.due}</small>
      </div>
      <button>Delete</button>
    `;

        div.querySelector("input").onclick = (e) => {
            e.stopPropagation();
            task.completed = !task.completed;
            save();
            updateDashboard();
            renderTasks(type);
        };

        div.querySelector("button").onclick = (e) => {
            e.stopPropagation();
            tasks = tasks.filter(t => t.id !== task.id);
            save();
            renderTasks(type);
        };

        div.addEventListener("click", () => openEditor(task.id));

        taskList.appendChild(div);
    });
}

function updateTodayTasks() {
    const list = document.getElementById("todayTaskList");
    list.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const priorityRank = { High: 1, Medium: 2, Low: 3 };

    const todayTasks = tasks
        .filter(t => {
            if (t.completed) return false;
            const taskDate = new Date(t.due);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate <= today;
        })
        .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

    if (todayTasks.length === 0) {
        list.innerHTML = "<li>No urgent tasks 🎉</li>";
        return;
    }

    todayTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `today-task ${task.priority.toLowerCase()}`;
        li.textContent = task.title;
        list.appendChild(li);
    });
}


function openEditor(id) {
    currentTask = tasks.find(t => t.id === id);

    views.forEach(v => v.classList.remove("active"));
    editor.classList.add("active");

    editTitle.value = currentTask.title;
    editNotes.value = currentTask.notes || "";
    editDueDate.value = currentTask.due;
    editPriority.value = currentTask.priority;
}
saveEdit.onclick = () => {
    currentTask.title = editTitle.value;
    currentTask.notes = editNotes.value;
    currentTask.due = editDueDate.value;
    currentTask.priority = editPriority.value;

    save();
    loadView("all");
};


function updateDashboard() {
    totalTasks.textContent = tasks.length;
    completedTasks.textContent = tasks.filter(t => t.completed).length;
    pendingTasks.textContent = tasks.filter(t => !t.completed).length;

    let percent = tasks.length
        ? (completedTasks.textContent / tasks.length) * 100
        : 0;

    progress.style.width = Math.min(percent, 100) + "%";
    updateTodayTasks();
}

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    darkToggle.checked = true;
} else {
    document.body.classList.remove("dark");
    darkToggle.checked = false;
}

darkToggle.onchange = () => {
    if (darkToggle.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
};


updateDashboard();
loadView("dashboard");
