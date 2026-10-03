from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
import time

app = Flask(__name__)
CORS(app)

# MySQL configuration
DB_HOST = os.getenv("DB_HOST", "mysql")
DB_USER = os.getenv("DB_USER", "taskuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "taskpassword")
DB_NAME = os.getenv("DB_NAME", "taskdb")


def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )


@app.route("/api/health", methods=["GET"])
def health_check():
    try:
        connection = get_db_connection()
        connection.close()

        return jsonify({
            "status": "healthy",
            "database": "connected"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 500


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, title, description, completed, created_at "
        "FROM tasks ORDER BY id DESC"
    )

    tasks = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(tasks)


@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()

    title = data.get("title")
    description = data.get("description", "")

    if not title:
        return jsonify({
            "error": "Task title is required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO tasks (title, description, completed)
        VALUES (%s, %s, %s)
        """,
        (title, description, False)
    )

    connection.commit()

    task_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Task created successfully",
        "id": task_id
    }), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()

    completed = data.get("completed")

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET completed = %s
        WHERE id = %s
        """,
        (completed, task_id)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Task updated successfully"
    })


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id = %s",
        (task_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Task deleted successfully"
    })


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "application": "AWS 3-Tier Task Manager",
        "status": "running"
    })


if __name__ == "__main__":
    # Give MySQL a moment when containers start together.
    time.sleep(5)

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )