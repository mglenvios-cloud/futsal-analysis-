# Documentacion Tecnica - Futsal Analysis Platform

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente (Browser)                       │
│                   Next.js + React + Tailwind                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                         Nginx                                │
│                   Proxy inverso + SSL                        │
└──────────┬──────────────────────────────────┬────────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│    Frontend          │         │        Backend              │
│  Next.js (Port 3000) │         │  FastAPI (Port 8000)        │
│                      │         │                              │
│  - Dashboard         │         │  - REST API                  │
│  - Analisis Video    │         │  - YOLO Detector             │
│  - Analisis Fisico   │         │  - OpenCV Processing         │
│  - Monitoreo Cardiaco│         │  - MediaPipe Pose            │
│  - Analisis Tactico  │         │  - ByteTrack Tracking        │
│  - Scouting IA       │         │  - Scraping Scouting         │
│  - Reportes          │         │  - Bleak Bluetooth            │
│  - Rankings          │         │  - ReportLab PDF             │
└─────────────────────┘         │  - Predictive AI             │
                                │  - SQLAlchemy ORM             │
                                └──────────┬───────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────────────┐
                                │      PostgreSQL 16           │
                                │  - Datos estructurados       │
                                │  - JSONB para datos flexibles│
                                └─────────────────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────────────┐
                                │         Redis                │
                                │  - Cache                    │
                                │  - Task Queue                │
                                └─────────────────────────────┘
```

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| Next.js | 14.1.0 | Framework React SSR |
| React | 18.2.0 | UI Library |
| TypeScript | 5.3.3 | Tipado estatico |
| Tailwind CSS | 3.4.1 | Estilos utilitarios |
| Recharts | 2.10.4 | Graficos interactivos |
| Zustand | 4.5.0 | Estado global |
| Axios | 1.6.5 | HTTP Client |
| Framer Motion | 11.0.3 | Animaciones |
| React Query | 5.17.19 | Data fetching |

### Backend
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| Python | 3.11 | Lenguaje principal |
| FastAPI | 0.109.0 | Framework web asincrono |
| SQLAlchemy | 2.0.25 | ORM para base de datos |
| Pydantic | 2.5.3 | Validacion de datos |
| Alembic | 1.13.1 | Migraciones |
| Celery | 5.3.6 | Tareas asincronas |

### Computer Vision & ML
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| YOLOv8 | 8.1.0 | Deteccion de objetos |
| OpenCV | 4.9.0 | Procesamiento de video |
| MediaPipe | 0.10.8 | Estimacion de pose |
| ByteTrack | 0.3.1 | Seguimiento de objetos |
| Supervision | 0.18.0 | Utilidades de vision |
| PyTorch | 2.1.2 | Deep Learning |
| Scikit-learn | 1.4.0 | ML models |

### Base de Datos
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| PostgreSQL | 16 | Base de datos principal |
| Redis | 7 | Cache y colas |

## Modulos del Sistema

### 1. Video Analyzer (`backend/app/services/video_analysis/`)
- **detector.py**: Implementa deteccion de jugadores, pelota, arcos y lineas usando YOLO, OpenCV y MediaPipe
- **processor.py**: Orquestra el procesamiento de video completo con seguimiento ByteTrack

**Flujo de procesamiento:**
1. Frame extraction
2. Player detection (YOLO)
3. Ball detection (HSV color space)
4. Goal detection (Hough Lines)
5. Field line extraction (Canny)
6. Pose estimation (MediaPipe)
7. Multi-object tracking (ByteTrack)

### 2. Physical Analyzer (`backend/app/services/physical_analysis/`)
- **analyzer.py**: Calcula metricas fisicas a partir de tracks de jugadores

**Metricas calculadas:**
- Distancia recorrida (conversion pixel->metro)
- Velocidad maxima y promedio (filtro gaussiano)
- Cantidad de sprints (>18 km/h)
- Aceleraciones y desaceleraciones (>2 m/s²)
- Cambios de direccion (>45 grados)
- Tiempo en movimiento/detenido
- Indice de intensidad

### 3. Cardiac Monitor (`backend/app/services/cardiac_monitor/`)
- **monitor.py**: Integracion Bluetooth LE con dispositivos cardiacos

**Protocolos soportados:**
- Bluetooth Heart Rate Service (0x180D)
- Compatible con Polar, Garmin, Apple Watch, Coros

**Simulacion:** Si no hay dispositivo Bluetooth, genera datos simulados realistas.

### 4. Scouting Agent (`backend/app/services/scouting/`)
- **agent.py**: Web scraping de Division A de AFA Futsal

**Fuentes:**
- afa.com.ar/futsal/division-a
- afa.com.ar/futsal/estadisticas
- afa.com.ar/futsal/clubes

**Datos recolectados:** Nombre, club, posicion, edad, altura, peso, goles, asistencias, tarjetas

### 5. Tactical Analyzer (`backend/app/services/tactical_analysis/`)
- **analyzer.py**: Analisis tactico usando clustering y estadisticas espaciales

**Detecciones:**
- Formacion (DBSCAN clustering)
- Sistema tactico (Rombo, Cuadrado, Ensenada, etc.)
- Presion alta/media/baja
- Cobertura y rotaciones
- Transiciones ofensivas/defensivas
- Superioridades/inferioridades numericas

### 6. Predictive AI (`backend/app/services/predictive_ai/`)
- **predictor.py**: Modelos ML para prediccion de rendimiento

**Modelos:**
- RandomForestRegressor: Rendimiento futuro
- GradientBoostingRegressor: Riesgo de lesion
- RandomForestRegressor: Potencial del jugador

**Output:** Score 1-100 en cada categoria + recomendaciones

### 7. Reports (`backend/app/services/reports/`)
- **generator.py**: Generacion de reportes multi-formato

**Formatos:**
- PDF (ReportLab): Reportes profesionales con tablas y estilos
- Excel (OpenPyXL): Hojas de calculo con formato
- CSV: Datos planos para analisis externo

## Base de Datos - Diagrama Entidad-Relacion

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  teams   │─────│ players  │─────│ matches  │
└──────────┘     └──────────┘     └──────────┘
                      │                │
                      ▼                ▼
              ┌──────────┐     ┌──────────┐
              │  stats   │     │  events  │
              └──────────┘     └──────────┘
                      │
                      ▼
              ┌──────────┐     ┌──────────┐
              │ cardiac  │     │  videos  │
              └──────────┘     └──────────┘
                      │
                      ▼
              ┌──────────┐     ┌──────────┐
              │ training │     │ injuries │
              └──────────┘     └──────────┘
                      │
                      ▼
              ┌──────────┐     ┌──────────┐
              │ tactical │     │scouting  │
              └──────────┘     └──────────┘
                      │
                      ▼
              ┌──────────┐
              │predictions│
              └──────────┘
```

## Seguridad

- Autenticacion JWT con refresh tokens
- Passwords hasheados con bcrypt
- CORS configurado por dominio
- Validacion de datos con Pydantic
- Rate limiting en API endpoints
- SSL/TLS en produccion
- Headers de seguridad (CSP, HSTS)

## Performance

- Cache en Redis para consultas frecuentes
- Compresion GZip en respuestas API
- Streaming de video para analisis en tiempo real
- Pool de conexiones a base de datos (20 conexiones)
- Workers asyncronos (uvicorn con 4 workers)
- Procesamiento de video con GPU (CUDA)

## Variables de Entorno

```env
# Base de Datos
DATABASE_URL=postgresql://user:pass@host:5432/futsal_analysis

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
SECRET_KEY=your-256-bit-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:3000,https://futsal.example.com

# Modelos
MODEL_PATH=/app/models/yolo

# Archivos
VIDEO_UPLOAD_PATH=/app/data/videos
REPORT_PATH=/app/data/reports
MAX_VIDEO_SIZE=524288000

# Bluetooth
BLUETOOTH_SCAN_TIMEOUT=30
HEART_RATE_MONITOR_INTERVAL=5

# Scouting
SCOUTING_INTERVAL_HOURS=24
```

## Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

## Licencia

Propietaria - Todos los derechos reservados.
Futsal Analysis Platform © 2024
