# HHV Automation Core

Núcleo portable de continuidad para Hip Hop en Vivo (HHV).

## Regla principal

Ninguna función crítica de HHV debe existir únicamente dentro de un proveedor externo. Make, Supabase, Apify, Metricool, Google Drive, Gemini u otros servicios se consideran adaptadores reemplazables.

## Objetivo

Permitir que el flujo HHV pueda migrar de un ejecutor a otro sin perder cola, estado, archivos ni reglas de negocio.

## Arquitectura objetivo

`Entrada -> Cola durable -> Procesador portable -> Adaptadores -> Persistencia -> Publicación`

Ejecutores previstos:
- Make (actual)
- Supabase Edge Functions / Postgres
- n8n self-hosted
- Activepieces self-hosted

## Versiones de referencia

- v5.3: producción estable, no modificar.
- v5.4.x: multimedia/batch en validación.

## Seguridad

No guardar tokens, API keys, service_role keys, contraseñas ni cookies en este repositorio. Usar variables de entorno o gestores de secretos.

## Carpetas

- `workflows/`: definición independiente del proveedor.
- `docs/`: recuperación, proveedores y failover.
- `schemas/`: contratos de datos.
- `.env.example`: nombres de secretos requeridos, sin valores reales.
