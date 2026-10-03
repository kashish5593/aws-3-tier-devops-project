const API_URL = "http://localhost:5000/api";


// Load tasks when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    checkHealth();
});


// Check backend/database health
async function checkHealth() {

    const statusElement = document.getElementById("systemStatus");

    try {

        const response = await fetch(`${API_URL}/health`);

        const data = await response.json();

        if (response.ok) {
            statusElement.textContent =
                "System Status: Healthy | Database Connected";
        } else {
            statusElement.textContent =
                "System Status: Database Error";
        }

    } catch (error) {

        statusElement.textContent =
            "System Status: Backend Unavailable";

        console.error(error);
    }
}


// Load tasks
async function loadTasks() {

    const taskList = document.getElementById("taskList");

    try {

        const response = await fetch(`${API_URL}/tasks`);

        const tasks = await response.json();

        taskList.innerHTML = "";

        if (tasks.length === 0) {

            taskList.innerHTML =
                "<p>No tasks available. Add your first task.</p>";

            return;
        }

        tasks.forEach(task => {

            const taskElement = document.createElement("div");

            taskElement.className = "task";

            taskElement.innerHTML = `
                <div class="task-info">

                    <div class="task-title ${
                        task.completed ? "completed" : ""
                    }">

                        ${escapeHtml(task.title)}

                    </div>

                    <div class="task-description">

                        ${escapeHtml(task.description || "")}

                    </div>

                </div>

                <div class="task-actions">

                    <button
                        class="complete-btn"
                        onclick="toggleTask(
                            ${task.id},
                            ${task.completed}
                        )"
                    >
                        ${task.completed ? "Undo" : "Complete"}
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})"
                    >
                        Delete
                    </button>

                </div>
            `;

            taskList.appendChild(taskElement);

        });

    } catch (error) {

        taskList.innerHTML =
            "<p>Unable to load tasks.</p>";

        console.error(error);
    }
}


// Add a new task
async function addTask() {

    const titleInput =
        document.getElementById("taskTitle");

    const descriptionInput =
        document.getElementById("taskDescription");

    const title = titleInput.value.trim();

    const description =
        descriptionInput.value.trim();

    if (!title) {

        alert("Please enter a task title.");

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    description: description
                })
            }
        );

        if (response.ok) {

            titleInput.value = "";
            descriptionInput.value = "";

            loadTasks();

        } else {

            alert("Failed to create task.");
        }

    } catch (error) {

        console.error(error);

        alert("Backend server is unavailable.");
    }
}


// Complete / undo task
async function toggleTask(taskId, currentStatus) {

    try {

        const response = await fetch(
            `${API_URL}/tasks/${taskId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    completed: !currentStatus
                })
            }
        );

        if (response.ok) {
            loadTasks();
        }

    } catch (error) {

        console.error(error);

    }
}


// Delete task
async function deleteTask(taskId) {

    const confirmed =
        confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/tasks/${taskId}`,
            {
                method: "DELETE"
            }
        );

        if (response.ok) {
            loadTasks();
        }

    } catch (error) {

        console.error(error);

    }
}


// Basic HTML escaping
function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}