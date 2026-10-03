CREATE DATABASE IF NOT EXISTS taskdb;

USE taskdb;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tasks (title, description, completed)
VALUES
(
    'Learn Docker',
    'Create and run the application using Docker Compose',
    FALSE
),
(
    'Configure AWS',
    'Create VPC, EC2, RDS and ALB',
    FALSE
),
(
    'Build CI/CD',
    'Create GitHub Actions deployment pipeline',
    FALSE
);