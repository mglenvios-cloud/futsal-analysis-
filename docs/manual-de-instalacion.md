# Manual de Instalacion - Futsal Analysis Platform

## Requisitos del Sistema

### Hardware Recomendado
- **CPU**: Intel Core i7 / AMD Ryzen 7 (8+ nucleos)
- **RAM**: 16 GB minimo, 32 GB recomendado
- **GPU**: NVIDIA GTX 1060 / RTX 2060+ (para procesamiento de video con CUDA)
- **Disco**: 50 GB SSD disponibles
- **Camara**: Celular con camara 1080p o superior

### Software Requerido
- Docker Desktop 24+
- Docker Compose 2.20+
- Node.js 20 LTS
- Python 3.11+
- Git
- PostgreSQL 16 (opcional, incluido via Docker)

---

## Instalacion Rapida (Docker)

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/your-org/futsal-analysis.git
cd futsal-analysis
```

### Paso 2: Configurar variables de entorno
```bash
cp backend/.env.example backend/.env
# Editar .env con configuraciones especificas si es necesario
```

### Paso 3: Iniciar con Docker Compose
```bash
docker-compose up -d
```

Esto iniciara:
- PostgreSQL 16 (puerto 5432)
- Backend FastAPI (puerto 8000)
- Frontend Next.js (puerto 3000)
- Nginx (puertos 80/443)
- Redis (puerto 6379)

### Paso 4: Verificar instalacion
```bash
# Verificar healthcheck
curl http://localhost:8000/health

# Respuesta esperada:
# {"status": "healthy", "service": "Futsal Analysis Platform", "version": "1.0.0"}
```

### Paso 5: Acceder a la aplicacion
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/api/docs
- **Redoc**: http://localhost:8000/api/redoc

---

## Instalacion Manual (sin Docker)

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Configurar base de datos
# Crear base de datos PostgreSQL llamada 'futsal_analysis'
psql -U postgres -c "CREATE DATABASE futsal_analysis;"
psql -U postgres -d futsal_analysis -f scripts/init_db.sql

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Configuracion de Base de Datos

### Esquema Principal

La base de datos PostgreSQL contiene las siguientes tablas:

| Tabla | Descripcion |
|-------|-------------|
| `teams` | Equipos de Division A |
| `players` | Jugadores con datos biometricos |
| `matches` | Partidos y resultados |
| `events` | Eventos de partido (goles, tarjetas, etc.) |
| `videos` | Videos subidos para analisis |
| `statistics` | Estadisticas fisicas, tecnicas y tacticas |
| `scouting_data` | Datos recolectados por Scouting IA |
| `cardiac_data` | Datos de monitoreo cardiaco |
| `trainings` | Sesiones de entrenamiento |
| `injuries` | Registro de lesiones |
| `tactical_analyses` | Analisis tactico por partido |
| `predictions` | Predicciones de IA |

---

## API REST - Endpoints Principales

### Jugadores
```
GET    /api/v1/players/          - Listar jugadores
GET    /api/v1/players/{id}      - Obtener jugador
POST   /api/v1/players/          - Crear jugador
PUT    /api/v1/players/{id}      - Actualizar jugador
DELETE /api/v1/players/{id}      - Eliminar jugador
```

### Equipos
```
GET    /api/v1/teams/            - Listar equipos
GET    /api/v1/teams/{id}        - Obtener equipo
GET    /api/v1/teams/{id}/players - Jugadores del equipo
```

### Videos y Analisis
```
POST   /api/v1/videos/upload     - Subir video
POST   /api/v1/videos/{id}/process - Procesar video
POST   /api/v1/analysis/physical/{video_id} - Analisis fisico
POST   /api/v1/analysis/tactical/{video_id} - Analisis tactico
POST   /api/v1/analysis/full/{video_id} - Analisis completo
```

### Scouting
```
POST   /api/v1/scouting/run      - Ejecutar scouting
GET    /api/v1/scouting/players   - Listar jugadores scouteados
POST   /api/v1/scouting/search    - Buscar jugador
```

### Cardiaco
```
GET    /api/v1/cardiac/devices   - Escanear dispositivos Bluetooth
POST   /api/v1/cardiac/connect   - Conectar dispositivo
POST   /api/v1/cardiac/start     - Iniciar monitoreo
GET    /api/v1/cardiac/current   - Datos actuales
```

### Reportes
```
GET    /api/v1/reports/player/{id}/pdf  - Reporte PDF jugador
GET    /api/v1/reports/player/{id}/excel - Reporte Excel jugador
GET    /api/v1/reports/player/{id}/csv   - Reporte CSV jugador
GET    /api/v1/reports/team/{id}/pdf     - Reporte PDF equipo
GET    /api/v1/reports/match/{id}/pdf    - Reporte PDF partido
```

### Predicciones
```
POST   /api/v1/predictions/{player_id}   - Predecir jugador
GET    /api/v1/predictions/ranking        - Ranking de jugadores
```

---

## Despliegue en Produccion

### Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql://user:pass@host:5432/futsal_analysis
SECRET_KEY=your-secret-key-here
ENVIRONMENT=production
CORS_ORIGINS=https://futsal.example.com
REDIS_URL=redis://redis:6379/0
MODEL_PATH=/app/models/yolo
```

### SSL/TLS
Colocar certificados SSL en `nginx/ssl/`:
- `cert.pem`
- `key.pem`

### Respaldo de Base de Datos
```bash
docker exec futsal-db pg_dump -U futsal_admin futsal_analysis > backup_$(date +%Y%m%d).sql
```

### Monitoreo
- Healthcheck: `GET /health`
- Logs: `docker-compose logs -f`

---

## Solucion de Problemas

### Error de conexion a base de datos
```bash
docker-compose restart postgres
```

### Error de GPU no detectada
```bash
# En Windows, asegurar que Docker Desktop tenga acceso a GPU
# Configurar en Docker Desktop -> Settings -> Resources -> Advanced
```

### Videos no se procesan
```bash
# Verificar espacio en disco
df -h
# Verificar logs del backend
docker-compose logs backend
```

---

## Contacto y Soporte

- **Documentacion**: http://localhost:8000/api/docs
- **Repositorio**: https://github.com/your-org/futsal-analysis
- **Email**: soporte@futsal-ai.com

---

*Futsal Analysis Platform v1.0.0 - Division A*
