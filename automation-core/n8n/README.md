# HHV + n8n self-hosted

Objetivo: disponer de un ejecutor visual gratuito y portable para HHV sin depender de créditos de Make.

## Fase 1 — laboratorio local en Windows

Se usa Docker Desktop para ejecutar dos contenedores:
- `n8n`: editor y motor de workflows.
- `postgres`: base interna de n8n.

La base de negocio de HHV sigue siendo Supabase. Este Postgres local solo guarda configuración/ejecuciones de n8n.

## Arranque

1. Instalar Docker Desktop en Windows y comprobar que Docker esté ejecutándose.
2. Clonar o descargar la rama `continuity-foundation`.
3. Entrar en `automation-core/n8n`.
4. Copiar `.env.example` como `.env`.
5. Cambiar `POSTGRES_PASSWORD` y `N8N_ENCRYPTION_KEY` localmente. No subir `.env` a GitHub.
6. Ejecutar `docker compose up -d`.
7. Abrir `http://localhost:5678`.
8. Crear el usuario propietario local de n8n.

## Regla de seguridad

No copiar secretos reales al workflow exportado. Las credenciales de Supabase, Apify, Gemini, Google y Metricool se crean dentro de n8n o mediante el gestor de secretos del host.

## Estrategia HHV

La migración no empieza procesando publicaciones reales. Primero se replica la lógica de v5.4.1 en modo laboratorio y se valida con un único payload de prueba.

Orden:
1. leer/reclamar un job de prueba;
2. deduplicar;
3. extraer post;
4. normalizar imagen/video/carrusel;
5. descargar media;
6. clasificar;
7. calcular mes/semana HHV;
8. persistir events/hhv_media;
9. actualizar cola;
10. recién después conectar HHV_INBOX real.

## Portabilidad

Los workflows exportados de n8n se guardarán en `automation-core/n8n/workflows/`, pero las reglas de negocio canónicas siguen en `automation-core/workflows/master.yaml`. De esta manera n8n puede reemplazarse por Supabase, Activepieces, Windmill u otro ejecutor sin redefinir HHV.
