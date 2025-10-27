# Proyecto capacitaciones

Este proyecto forma parte de una gestión de capacitaciones, usuarios, módulos, capitulos, contenidos y insignias. El backend está desarrollado con NestJS utilizando arquitectura hexagonal, mientras que el frontend sigue la estructura estándar de Angular.
## Backend (NestJS)

### Tecnologías
- NestJS con TypeORM
- PostgreSQL
- Node.js 20.x

### Estructura del Proyecto
```
bakckend/
├── src/
│   ├── application/services/
│   ├── domain/
│   │   ├── chapters/
│   │   ├── courses/
│   │   ├── modules-category/
│   │   ├── progress/
│   │   ├── user-badge/
│   │   └── users/
│   ├── infrastructure/
│   ├── app.module.ts
│   └── main.ts
├── db/
├── init_db.sql
├── .env
└── package.json
```

### Instalación

**1. Clonar el repositorio**
```bash
git clone https://github.com/belllgg/Portal-de-Capacitaciones
cd backend
cd frontend
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno (.env)**
```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_SCHEMA=
DB_SSL=true
DB_CONNECT_TIMEOUT=10000
DB_POOL_SIZE=5
JWT_SECRET=
JWT_EXPIRATION=1h
PORT=3000
AUTH_USERNAME=admin
AUTH_PASSWORD=password123

```

**4. Inicializar base de datos**
```bash
psql -U postgres -d cursos_db -f database_script.sql
```

**5. Ejecutar en desarrollo**
```bash
npm run start:dev
```

**6. Acceder a la API**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api

### Scripts
```bash
npm run start:dev    # Modo desarrollo
npm run start:prod   # Modo producción
npm run test         # Ejecutar tests
```

---

## Frontend (Angular)

### Tecnologías
- Angular CLI
- Bootstrap

### Estructura del Proyecto
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── app.module.ts
│   └── index.html
├── angular.json
└── package.json
```

### Instalación

**1. Navegar al directorio**
```bash
cd frontend
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Ejecutar en desarrollo**
```bash
ng serve
```

**4. Acceder a la aplicación**
- App: http://localhost:4200

### Scripts
```bash
ng serve    # Modo desarrollo
ng build    # Compilar para producción
ng test     # Ejecutar tests
```
