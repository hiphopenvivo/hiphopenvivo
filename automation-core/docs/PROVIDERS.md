# HHV Provider Matrix

| Función | Primario actual | Fallback inicial | Fallback objetivo |
|---|---|---|---|
| Orquestación | Make | Supabase/Postgres | n8n o Activepieces self-hosted |
| Extracción Instagram | Apify | Revisión manual | Segundo extractor compatible |
| Clasificación IA | Gemini | Revisión manual | Segundo proveedor IA con mismo JSON contract |
| Base de datos | Supabase Postgres | Backup SQL | PostgreSQL compatible |
| Archivos | Google Drive | Supabase Storage | S3 compatible |
| Publicación | Metricool | HHV_PUBLICACION_QUEUE manual | Segundo publicador/API compatible |
| Web | Vercel | despliegue alternativo | cualquier runtime compatible |

## Contrato de proveedor

Cada adaptador debe exponer una interfaz conceptual estable:

- `healthcheck()`
- `execute(input)`
- `normalize(output)`
- `classify_error(error)`
- `retryable(error)`

La lógica editorial y de negocio no debe depender del formato interno del proveedor.

## Política de cambio

Un proveedor puede ser reemplazado si:
1. supera cuota o costo objetivo;
2. queda inaccesible;
3. rompe compatibilidad;
4. existe alternativa más estable;
5. el cambio conserva los contratos de entrada/salida.

## Estados operativos de proveedor

- `OK`
- `DEGRADED`
- `QUOTA_WARNING`
- `DOWN`
- `DISABLED`
