
# InfraGestion BQ - Documentación Técnica

## A) Arquitectura y Flujo
1. **Frontend (React/Tailwind):** SPA responsive que consume la API de FastAPI. Maneja estado de autenticación via Google Identity Services.
2. **Backend (FastAPI):** Expone endpoints RESTful. Valida el ID Token de Google contra la tabla `usuarios` (whitelist) en BigQuery.
3. **Data Layer (BigQuery):** Operaciones directas (INSERT/UPDATE/SELECT) usando el SDK oficial de Python. No se requiere caché local para mantener consistencia administrativa pura.
4. **BI Layer:** Looker Studio consulta la vista `bi_gestiones` e integra el reporte vía iframe.

## B) DDL SQL para tablas nuevas
Dataset: `infra_gestion`

```sql
-- Tabla de Usuarios Autorizados (Whitelist)
CREATE TABLE IF NOT EXISTS `infra_gestion.usuarios` (
  email STRING NOT NULL,
  nombre STRING,
  rol STRING NOT NULL, -- Admin, Operador, Supervisor, Consulta
  activo BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  created_by STRING,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_by STRING
) PRIMARY KEY (email) NOT ENFORCED;

-- Tabla de Auditoría por Eventos
CREATE TABLE IF NOT EXISTS `infra_gestion.gestiones_eventos` (
  id_evento STRING NOT NULL,
  id_gestion STRING NOT NULL,
  ts_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  actor_email STRING,
  actor_rol STRING,
  tipo_evento STRING, -- CREACION, EDICION, CAMBIO_ESTADO, COMENTARIO, BORRADO_LOGICO
  estado_anterior STRING,
  estado_nuevo STRING,
  comentario STRING,
  payload_json JSON
);
```

## C) Blueprint FastAPI (Endpoints Clave)

**Estructura:**
- `/app`
  - `main.py`
  - `auth.py` (Validación JWT Google)
  - `schemas.py` (Pydantic models)
  - `routers/`
    - `gestiones.py`
    - `catalogos.py`
    - `usuarios.py`

**Ejemplo Query BigQuery (Insert Gestión):**
```python
query = f"""
INSERT INTO `{PROJECT}.{DATASET}.gestiones` 
(id_gestion, nro_expediente, estado, fecha_ingreso, departamento, localidad, detalle, created_by)
VALUES (@id, @exp, @estado, @fecha, @depto, @localidad, @detalle, @user)
"""
job_config = bigquery.QueryJobConfig(
    query_parameters=[
        bigquery.ScalarQueryParameter("id", "STRING", str(uuid.uuid4())),
        bigquery.ScalarQueryParameter("depto", "STRING", gestion.departamento),
        # ... rest of params
    ]
)
client.query(query, job_config=job_config).result()
```

## E) Tabla de Transiciones de Estado por Rol

| Desde | Hacia | Rol Mínimo | Requiere Comentario |
|-------|-------|------------|---------------------|
| INGRESADO | DERIVADO A SUAC | Operador | No |
| INGRESADO | NO REMITE SUAC | Operador | **SÍ** |
| INGRESADO | LISTA P/ INAUGURAR | Operador | No |
| DERIVADO... | FINALIZADA | Supervisor | No |
| CUALQUIERA | ARCHIVADO | Supervisor | **SÍ** |

## F) Plan de Despliegue GCP Paso a Paso
1. **IAM:** Crear Service Account `bq-crud-sa` con roles: `BigQuery Data Editor`, `BigQuery User`, `Secret Manager Accessor`.
2. **Secret Manager:** Guardar `CLIENT_ID` de Google OAuth.
3. **BigQuery:** Ejecutar DDLs en el dataset `infra_gestion`.
4. **Cloud Run:** Desplegar contenedor de FastAPI.
   - Setear env vars: `PROJECT_ID`, `DATASET_ID`, `GOOGLE_CLIENT_ID`.
5. **DNS/Frontend:** Configurar dominio y habilitar HTTPS.
6. **OAuth:** Configurar en Google Console la "Authorized redirect URIs" apuntando al dominio del app.

## G) Checklist de Pruebas
- [ ] Validar que `departamento` y `localidad` no permitan nulos en POST /gestiones.
- [ ] Verificar que un usuario fuera de whitelist sea rechazado (403).
- [ ] Comprobar que ARCHIVADO sin comentario devuelva error de negocio (400).
- [ ] Confirmar que `fecha_finalizacion` se setee automáticamente al pasar a FINALIZADA.
- [ ] Verificar inserción automática en `gestiones_eventos` en cada cambio.
