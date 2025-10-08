-- ========================
-- CREACIÓN DE TABLAS Y REGISTROS INICIALES
-- ========================

-- Tabla roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (id, name) VALUES
(1, 'ADMIN'),
(2, 'COLLABORATOR')
ON CONFLICT (id) DO NOTHING;

-- Tabla user_states
CREATE TABLE IF NOT EXISTS user_states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO user_states (id, name) VALUES
(1, 'ACTIVE'),
(2, 'INACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Tabla users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    state_id INTEGER NOT NULL DEFAULT 1 REFERENCES user_states(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla modules
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO modules (name, description, icon) VALUES
('Fullstack', 'Desarrollo Fullstack, Backend y Frontend', '🖥️'),
('APIs e Integraciones', 'DataPower, IBM Bus, Broker, APIs, Microservicios', '🔗'),
('Cloud', 'Tecnologías y servicios en la nube', '☁️'),
('Data Engineer', 'Ingeniería de datos y análisis', '📊')
ON CONFLICT (name) DO NOTHING;

-- Tabla course_states
CREATE TABLE IF NOT EXISTS course_states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO course_states (id, name, description) VALUES
(1, 'DRAFT', 'Curso en borrador, no visible para usuarios'),
(2, 'ACTIVE', 'Curso publicado y disponible'),
(3, 'INACTIVE', 'Curso pausado temporalmente'),
(4, 'ARCHIVED', 'Curso archivado, solo visible en historial')
ON CONFLICT (id) DO NOTHING;

-- Tabla courses
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    instructor_name VARCHAR(100),
    thumbnail_url VARCHAR(500),
    duration_hours DECIMAL(5,2),
    state_id INTEGER NOT NULL DEFAULT 2 REFERENCES course_states(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla chapter_states
CREATE TABLE IF NOT EXISTS chapter_states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO chapter_states (id, name) VALUES
(1, 'DRAFT'),
(2, 'PUBLISHED'),
(3, 'ARCHIVED')
ON CONFLICT (id) DO NOTHING;

-- Tabla chapters
CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    state_id INTEGER NOT NULL DEFAULT 2 REFERENCES chapter_states(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla content_types
CREATE TABLE IF NOT EXISTS content_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO content_types (name) VALUES
('VIDEO'),
('PDF'),
('PRESENTATION'),
('DOCUMENT'),
('LINK')
ON CONFLICT (name) DO NOTHING;

-- Tabla chapter_contents
CREATE TABLE IF NOT EXISTS chapter_contents (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    content_type_id INTEGER NOT NULL REFERENCES content_types(id),
    title VARCHAR(255),
    file_url VARCHAR(500),
    file_size_mb DECIMAL(10,2),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla user_chapter_progress
CREATE TABLE IF NOT EXISTS user_chapter_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_chapter UNIQUE (user_id, chapter_id),
    CONSTRAINT fk_user_chapter_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_chapter_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Tabla user_course_progress
CREATE TABLE IF NOT EXISTS user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP NULL,
    progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT uq_user_course UNIQUE (user_id, course_id),
    CONSTRAINT fk_user_course_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_course_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Registro inicial de progreso
INSERT INTO user_course_progress (user_id, course_id, started_at, progress_percentage)
VALUES (1, 2, NOW(), 0)
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Tabla badge_types
CREATE TABLE IF NOT EXISTS badge_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    criteria TEXT
);

-- Tabla user_badges
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    badge_type_id INTEGER NOT NULL,
    course_id INTEGER,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT fk_badge_type FOREIGN KEY(badge_type_id) REFERENCES badge_types(id),
    CONSTRAINT fk_course FOREIGN KEY(course_id) REFERENCES courses(id),
    CONSTRAINT unique_user_badge_course UNIQUE(user_id, badge_type_id, course_id)
);

-- Consulta final de user_badges
SELECT * FROM user_badges;
