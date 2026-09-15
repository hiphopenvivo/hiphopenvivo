# HHV_PROCESSOR v5.4.1 — mapa Make → n8n

Este documento traduce funciones, no números de módulos. El objetivo es evitar dependencia de la estructura interna de Make.

| Etapa HHV | Make v5.4.1 | n8n objetivo | Estado inicial |
|---|---|---|---|
| Buscar trabajo | Google Sheets Search Rows | Supabase `hhv_jobs` / HHV_INBOX adapter | Pendiente |
| Marcar ocupado | Update Row = Procesando | RPC `hhv_claim_jobs` | Base creada |
| Leer post | HTTP | HTTP Request | Por implementar |
| Extraer Instagram | Apify HTTP | HTTP Request / adapter Apify | Por implementar |
| Parsear payload | Parse JSON | Code / Set | Por implementar |
| Normalizar post | Basic Feeder | Code `normalizeInstagramPost` | Por implementar |
| Elegir media principal | ComposeTransformer | Code `selectPrimaryMedia` | Por implementar |
| Descargar media | HTTP DownloadFile | HTTP Request binario | Por implementar |
| Clasificar evento | Gemini | HTTP/Gemini node con contrato JSON | Por implementar |
| Calcular mes/semana | fórmulas Make | Code `calculateHHVWeek` | Regla definida |
| Upsert evento | Supabase HTTP | Postgres/Supabase REST | Por implementar |
| Guardar media | `hhv_media` HTTP | Postgres/Supabase REST | Tabla existente |
| Guardar Drive | Google Drive modules | Google Drive / adapter | Por implementar |
| Finalizar | Update HHV_INBOX | Update job + adapter Sheets | Por implementar |

## Regla definitiva de semana

No copiar fórmulas opacas desde Make. Implementar una función testeable:
- SEMANA 1: día 1 hasta primer domingo del mes.
- SEMANA 2: lunes siguiente a domingo.
- SEMANA 3: lunes siguiente a domingo.
- SEMANA 4: lunes siguiente hasta fin de mes.

Casos de prueba obligatorios:
- 2026-09-12 → SEMANA 2
- 2026-09-17 → SEMANA 3
- 2026-10-11 → SEMANA 2
- 2026-10-17 → SEMANA 3
- 2026-11-20 → SEMANA 4

## Contrato multimedia

El normalizador debe entregar siempre una forma común, independientemente de Apify:

```json
{
  "post_url": "...",
  "shortcode": "...",
  "caption": "...",
  "format": "IMAGE|VIDEO|CAROUSEL",
  "media": [
    {
      "order": 1,
      "type": "IMAGE|VIDEO",
      "source_url": "...",
      "thumbnail_url": null,
      "mime_type": null,
      "width": null,
      "height": null,
      "duration_seconds": null,
      "has_audio": null
    }
  ]
}
```

Esto elimina errores como depender directamente de `video_versions`, `image_versions2` o `carousel_media` en etapas posteriores.

## Política de pruebas

1. No conectar publicaciones reales al comienzo.
2. Usar un payload IMAGE conocido.
3. Usar un payload VIDEO conocido.
4. Usar un payload CAROUSEL conocido.
5. Confirmar normalización idéntica a la especificación.
6. Probar escritura en tablas de prueba/cola.
7. Solo después habilitar un job real con límite 1.
8. Make permanece congelado como referencia y no se modifica durante esta migración.
