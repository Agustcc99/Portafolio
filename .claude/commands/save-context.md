---
description: Guarda o actualiza automáticamente el mapa del proyecto y el resumen de la conversación.
---

Vas a mantener actualizados dos archivos de contexto del proyecto. Hacé todo esto sin preguntarme nada, decidí vos el modo (crear desde cero o actualizar) según lo que encuentres.

REGLAS GENERALES:
- Máxima densidad de información, mínimo de tokens. Nada de prosa, nada de cortesías, nada de repetir lo obvio.
- Notación tipo firma/bullet, no párrafos.
- Documentá solo lo que alguien necesitaría para retomar el trabajo sin releer todo el código o toda la charla.

=== PARTE 1: MAPA DEL PROYECTO ===
Archivo: .claude/context/PROJECT_MAP.md

1. Si el archivo NO existe: escaneá todo el proyecto (ignorando node_modules, dist, .git, build, etc) y generá:
   - Árbol de carpetas/archivos relevantes
   - Por cada archivo con lógica no trivial: funciones/clases exportadas, con firma (params -> return) y máximo 6 palabras de propósito
   - Sección "DEPS CLAVE": relaciones de import importantes entre módulos
   - Sección "PENDIENTE": TODOs detectados en el código
   - Al final: "ULTIMO COMMIT MAPEADO: <hash actual de git rev-parse HEAD>"

2. Si el archivo YA existe: leé el hash guardado en "ULTIMO COMMIT MAPEADO" y corré `git diff --name-only <hash> HEAD` para ver qué cambió.
   - Si cambió menos del 40% de los archivos mapeados: actualizá solo las secciones de esos archivos (agregá los nuevos, quitá los borrados, corregí los modificados). No toques el resto.
   - Si cambió el 40% o más, o no hay hash guardado, o el diff falla por cualquier motivo: regenerá el archivo completo desde cero, como si no existiera.
   - Actualizá el hash al final con el commit actual.

=== PARTE 2: RESUMEN DE LA CONVERSACIÓN ===
Archivo: .claude/context/SESSION_LOG.md

1. Si el archivo NO existe: creálo con un bloque "## ESTADO ACTUAL" (resumen de 3-5 líneas de en qué está el proyecto y esta sesión) y debajo una sección con fecha/hora de hoy listando: qué se hizo/decidió en esta sesión, qué quedó pendiente, qué se descartó (si aplica).

2. Si el archivo YA existe: NO borres nada. Agregá una sección nueva al final con fecha/hora de hoy con lo mismo que arriba. Además actualizá (sobreescribiendo solo eso) el bloque "## ESTADO ACTUAL" al principio.

3. Si el archivo supera las 300 líneas: además de agregar la sección nueva, comprimí las entradas de hace más de 30 días en un solo bloque resumen "## HISTORIAL COMPRIMIDO (hasta <fecha>)", conservando solo decisiones importantes, y borrá las entradas individuales viejas que ya quedaron resumidas ahí.

=== AL TERMINAR ===
Mostrame solo:
- Qué archivos se crearon/actualizaron
- Si el mapa fue creado desde cero, actualizado parcial, o regenerado completo (y por qué)
- Cuántas líneas tiene cada archivo ahora

No repitas el contenido completo de los archivos en tu respuesta.
