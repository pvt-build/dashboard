# Pantallazos del celular → terminal → Notion

Cómo entra una captura del teléfono al OS y dónde termina. No hay bandeja
única: cada captura se rutea al destino que le corresponde.

## Las dos rutas de entrada

| | Ruta A · Notion directo | Ruta B · adjuntar en el chat |
|---|---|---|
| Cómo | Share sheet del celular → Notion | Adjuntar la imagen en la sesión |
| Necesita sesión abierta | No | Sí |
| Dónde queda el archivo | Notion (privado) | `~/.claude/uploads/` → `assets/capturas/` |
| Sirve para | Cliente, montos, WhatsApp, cualquier cosa sensible | Referencias, UI, capturas públicas |
| Latencia | Queda guardado, se rutea después | Se rutea en el momento |

**Ruta A** es la que no falla: el archivo nunca pasa por este repo. Es la
obligatoria cuando la captura tiene nombres de clientes o plata.

**Ruta B** es la rápida cuando ya estás en una sesión y querés construir sobre
la imagen ahí mismo.

## El router — a dónde va cada captura

| Qué es | Destino | Data source |
|---|---|---|
| Idea de contenido propia | `Repositorio-contenido` · page nueva | `collection://2501b21d-b3ba-806d-bae1-000bf51efaff` |
| Referencia de creador ajeno | `Swipe File` · Tipo Competencia/Inspiración | `collection://3159ee8e-cef2-4519-bca0-eea05cb2a4c5` |
| Win o suceso de un cliente | `🏆 Wins de Clientes` · carpeta única | `collection://aff87b31-66b2-425f-9168-c5ca99227af3` |
| Algo importante que hay que hacer | `backlog-database-tareas` | `collection://1ac40bba-85fd-43cb-be52-d1bf83678a2c` |

Una referencia de creador que además dispara una idea propia entra dos veces:
la captura al Swipe File, la idea al Repositorio, y se enlazan por
`Inspirado en` / `Idea resultante`.

### Campos mínimos al crear

- **Repositorio-contenido** — `Nombre idea` (título), `Estado: Pending`,
  `Categoría`, `Formato`. La captura va embebida en el cuerpo.
- **Swipe File** — `Nombre` (título), `Tipo`, `Formato`, `Link` si se conoce.
  `Por qué me llamó la atención` se deja vacío: se llena en la sesión semanal.
- **Wins de Clientes** — `Win` (título), `Cliente` (relación al CRM), `Fecha`,
  `Tipo`, `Fuente` y `Qué pasó`. Ver la regla de abajo.
- **backlog** — `Name` (título), `Agente`, `Capa`, `Estado: Sin empezar`.

### La regla de los Wins

Todos los wins de clientes van a **una sola carpeta**: `🏆 Wins de Clientes`,
colgando de `07 · Delivery` y relacionada al CRM.

Cada win **se lee por sus campos, nunca por el nombre del archivo**. El título
dice el logro completo y `Qué pasó` lo cuenta entero. Si hay que abrir la
imagen para entender el win, el registro está mal cargado.

La captura es opcional. Es respaldo, no la fuente.

## Restricciones reales del entorno

Tres cosas que condicionan el diseño y conviene no olvidar:

**El contenedor es efímero.** Lo que queda en la terminal se pierde cuando la
sesión muere. Guardar una captura en el repo significa commitear y pushear.

**`api.notion.com` está bloqueado por el proxy de egress** de las sesiones
remotas. No se puede subir el binario de una imagen a Notion desde acá. La
única vía es `create-attachment` con `source_url`: se le pasa una URL pública
y Notion la descarga desde sus propios servidores.

**Este repo es público.** Una imagen commiteada acá queda en
`https://pvt-build.github.io/dashboard/assets/capturas/<archivo>` y la ve
cualquiera con el link. Eso es justo lo que la hace alcanzable para Notion —
y justo por eso las capturas de clientes no van por acá. Para esas, Ruta A.

## Flujo de la Ruta B, paso a paso

1. Adjuntar la imagen en la sesión. Aterriza en `~/.claude/uploads/<sesión>/`
   — no en `/mnt/attach`, que existe pero queda vacío.
2. `.privatebuild/captura.sh <slug>` — la mueve a `assets/capturas/`, commitea,
   pushea e imprime la URL pública.
3. Con esa URL, `create-attachment` la sube a Notion y `create-pages` la deja
   en el destino que manda el router.

## Nombres de archivo

`AAAA-MM-DD-slug.png`, slug en minúsculas y guiones. La fecha adelante
mantiene el directorio ordenado por cuándo entró, no por tema.
