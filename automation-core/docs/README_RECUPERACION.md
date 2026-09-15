# HHV — Plan Maestro de Recuperación

## Objetivo

Mantener HHV operativo aunque se agoten créditos, un proveedor caiga o una cuenta externa deje de estar disponible.

## Niveles de contingencia

### Nivel 0 — Normal
Make ejecuta el workflow habitual. Supabase conserva el estado durable.

### Nivel 1 — Umbral de consumo
Cuando un proveedor supera el 80% de su cuota mensual:
1. reducir ejecuciones no críticas;
2. agrupar trabajos;
3. evitar reprocesar elementos ya completos;
4. preservar nuevos ingresos en cola.

### Nivel 2 — Créditos agotados
1. dejar de invocar el proveedor agotado;
2. seguir aceptando entradas;
3. guardar cada trabajo como `PENDIENTE`;
4. no borrar ni sobrescribir payloads;
5. activar el proveedor alternativo cuando corresponda.

### Nivel 3 — Proveedor inaccesible
1. marcar proveedor como `DOWN`;
2. activar ejecutor de fallback;
3. reclamar trabajos pendientes desde la misma cola;
4. respetar idempotency_key para evitar duplicados;
5. continuar desde el último estado persistido.

### Nivel 4 — Migración completa
1. desplegar `automation-core` en el nuevo ejecutor;
2. cargar secretos desde un gestor seguro;
3. conectar Postgres/Supabase;
4. ejecutar pruebas con una sola fila;
5. validar imagen, Reel y carrusel;
6. habilitar procesamiento gradual;
7. mantener el proveedor anterior apagado para evitar carreras.

## Regla de oro

Nunca dos ejecutores deben reclamar el mismo trabajo al mismo tiempo sin bloqueo/idempotencia.

## Checklist mínimo antes de cambiar de motor

- v5.3 estable preservada.
- v5.4.x detenida durante la migración.
- cola visible y consultable.
- último job procesado identificado.
- claves y tokens fuera del repositorio.
- una prueba controlada con `Limit = 1` o equivalente.
- verificación de Drive, Supabase y HHV_INBOX.
- publicación automática desactivada hasta validar el nuevo motor.

## Recuperación por proveedor

### Make
Fallback: Supabase worker o n8n.

### Apify
Fallback inicial: revisión manual controlada. Luego incorporar segundo extractor compatible.

### Gemini
Fallback: revisión manual; después configurar segundo proveedor IA con el mismo contrato JSON.

### Google Drive
Fallback: Supabase Storage u objeto S3 compatible. Las referencias de archivos deben guardarse por ID/URL, nunca sólo dentro del proveedor.

### Metricool
Fallback: cola `HHV_PUBLICACION_QUEUE` + publicación manual/controlada hasta integrar otro publicador.

## Criterio de éxito

Una migración es exitosa cuando el nuevo motor puede tomar un job `PENDIENTE`, procesarlo una única vez y dejar exactamente los mismos estados y contratos de salida que el motor anterior.
