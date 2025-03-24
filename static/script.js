document.addEventListener("DOMContentLoaded", () => {
    // Fetch tasks on page load
    fetchTasks();

    // Add event listeners
    document.getElementById("addTaskBtn").addEventListener("click", addTask);
    document.getElementById("clearTasksBtn").addEventListener("click", clearTasks);

    // Enable/disable add task button based on input
    const taskDescInput = document.getElementById("taskDescription");
    const addTaskBtn = document.getElementById("addTaskBtn");
    taskDescInput.addEventListener("input", () => {
        addTaskBtn.disabled = taskDescInput.value.trim() === "";
    });
});

function fetchTasks() {
    fetch("/tasks")
        .then(response => {
            console.log("Fetch response status:", response.status);
            return response.json();
        })
        .then(tasks => {
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = "";

            // Group tasks by date
            const tasksByDate = {};
            tasks.forEach(task => {
                if (!tasksByDate[task.date]) {
                    tasksByDate[task.date] = [];
                }
                tasksByDate[task.date].push(task);
            });

            // Sort dates and render
            Object.keys(tasksByDate).sort().forEach(date => {
                // Add date header
                const dateHeader = document.createElement("li");
                dateHeader.className = "date-header";
                dateHeader.textContent = formatDate(date);
                taskList.appendChild(dateHeader);

                // Render tasks for this date
                tasksByDate[date].forEach(task => {
                    const li = createTaskElement(task);
                    taskList.appendChild(li);
                });
            });

            updateTaskCount();
        })
        .catch(error => {
            console.error("Error fetching tasks:", error);
            // Log the full error object
            console.log("Full error object:", JSON.stringify(error, null, 2));
            alert("Failed to load tasks. Check console for details.");
        });
}

function addTask() {
    const description = document.getElementById("taskDescription").value.trim();
    const time = document.getElementById("taskTime").value;
    const date = document.getElementById("taskDate").value || new Date().toISOString().split('T')[0];

    if (!description || !time) {
        alert("Please enter a task description and time.");
        return;
    }

    const taskData = { description, time, date };
    console.log("Sending task data:", JSON.stringify(taskData));

    fetch("/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        console.log("Add task response status:", response.status);
        // Log the full response
        console.log("Full response:", response);

        // Check if response is ok before parsing JSON
        if (!response.ok) {
            // Try to parse error message
            return response.json().then(errorData => {
                throw new Error(errorData.error || "Failed to add task");
            });
        }
        return response.json();
    })
    .then(() => {
        // Reset input fields
        document.getElementById("taskDescription").value = "";
        document.getElementById("taskTime").value = "";
        document.getElementById("taskDate").value = "";

        // Refresh task list
        fetchTasks();
    })
    .catch(error => {
        console.error("Error adding task:", error);
        // Log the full error object
        console.log("Full error object:", JSON.stringify(error, null, 2));
        alert(`Failed to add task: ${error.message}`);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Fetch tasks on page load
    fetchTasks();

    // Add event listeners
    document.getElementById("addTaskBtn").addEventListener("click", addTask);
    document.getElementById("clearTasksBtn").addEventListener("click", clearTasks);

    // Enable/disable add task button based on input
    const taskDescInput = document.getElementById("taskDescription");
    const addTaskBtn = document.getElementById("addTaskBtn");
    taskDescInput.addEventListener("input", () => {
        addTaskBtn.disabled = taskDescInput.value.trim() === "";
    });
});

function fetchTasks() {
    fetch("/tasks")
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = "";

            // Group tasks by date
            const tasksByDate = {};
            tasks.forEach(task => {
                if (!tasksByDate[task.date]) {
                    tasksByDate[task.date] = [];
                }
                tasksByDate[task.date].push(task);
            });

            // Sort dates and render
            Object.keys(tasksByDate).sort().forEach(date => {
                // Add date header
//                const dateHeader = document.createElement("li");
//                dateHeader.className = "date-header";
//                dateHeader.textContent = formatDate(date);
//                taskList.appendChild(dateHeader);

                // Render tasks for this date
                tasksByDate[date].forEach(task => {
                    const li = createTaskElement(task);
                    taskList.appendChild(li);
                });
            });

            updateTaskCount();
        })
        .catch(error => {
            console.error("Error fetching tasks:", error);
            alert("Failed to load tasks. Please try again.");
        });
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.dataset.taskId = task.id;

    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    // Task description
    const taskText = document.createElement("span");
    taskText.textContent = `${task.description} - ${task.time}`;
    if (task.completed) {
        taskText.classList.add("completed");
    }

    li.appendChild(checkbox);
    li.appendChild(taskText);
    return li;
}

function addTask() {
    const description = document.getElementById("taskDescription").value.trim();
    const time = document.getElementById("taskTime").value;
    const date = document.getElementById("taskDate").value || new Date().toISOString().split('T')[0];

    if (!description || !time) {
        alert("Please enter a task description and time.");
        return;
    }

    fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, time, date })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to add task");
        }
        return response.json();
    })
    .then(() => {
        // Reset input fields
        document.getElementById("taskDescription").value = "";
        document.getElementById("taskTime").value = "";
        document.getElementById("taskDate").value = "";

        // Refresh task list
        fetchTasks();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to add task. Please try again.");
    });
}

function toggleTask(taskId) {
    fetch(`/tasks/${taskId}`, { method: "PATCH" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to toggle task");
            }
            return response.json();
        })
        .then(() => fetchTasks())
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to update task. Please try again.");
        });
}

function clearTasks() {
    const confirmClear = confirm("Are you sure you want to clear completed tasks?");
    if (confirmClear) {
        fetch("/tasks/clear", { method: "DELETE" })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to clear tasks");
                }
                return response.json();
            })
            .then(() => {
                fetchTasks();
                alert("Completed tasks have been cleared!");
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Failed to clear tasks. Please try again.");
            });
    }
}

function updateTaskCount() {
    const taskList = document.getElementById("taskList");
    const totalTasks = taskList.querySelectorAll('li:not(.date-header)').length;
    const completedTasks = taskList.querySelectorAll('.completed').length;

    const taskCountEl = document.getElementById("taskCount");
    if (taskCountEl) {
        taskCountEl.textContent = `${completedTasks}/${totalTasks} tasks completed`;
    }
}

function formatDate(dateString) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}