# PRIVATE-OS · módulo Business

Panel de una sola pantalla con ocho pestañas arriba. **Athlete OS no vive
acá** — es otro OS y tiene su propio panel.

Artifact: https://claude.ai/code/artifact/258b1b53-d69e-4ad1-81b9-814282f1a504

## Las ocho pestañas

| # | Pestaña | Qué muestra |
|---|---|---|
| 01 | Radar | Las 8 capas del negocio, hoy contra objetivo |
| 02 | Mes a mes | Comparativo jun / jul / ago con delta |
| 03 | Áreas | Las 7 áreas del OS y su etapa |
| 04 | Marketing | Qué se mide y qué no en contenido |
| 05 | Comercial | El troncal de 8 tramos |
| 06 | Canales | Revenue por origen, con la etiqueta corregida |
| 07 | Infra | Skills y sistemas, y cuáles corren solos |
| 08 | Finanzas | Caja del mes y escenario de salida |

Las **7 áreas** salen del ecosystem map (`Webs/ecosystem`): Marketing,
Comercial, Onboarding, Producto, Consultoría, Comunidad e Infra.

## Arquitectura de datos

Todo el panel se dibuja desde un único bloque dentro del HTML:

```
index.html
   └── <script id="pvt-data">   ← el JSON con todo
         ↑
   .privatebuild/sync.py        ← lo regenera desde las fuentes
```

No se edita el JSON a mano. Se corre el sync.

| Bloque | Fuente | Estado |
|---|---|---|
| finanzas | `Finanzas/plan-financiero.data.json` | **automático** |
| infra | `~/.claude/skills` + repos | **automático** |
| comercial | Notion · CRM + Llamadas Comerciales | necesita `NOTION_TOKEN` |
| marketing | Notion · Repositorio-contenido | necesita `NOTION_TOKEN` |
| radar, meses, areas, canales | juicio + consolidado | a mano |

```bash
python3 "Webs/panel-troncal/.privatebuild/sync.py"            # en seco
python3 "Webs/panel-troncal/.privatebuild/sync.py" --aplicar
```

El header muestra un punto de frescura por fuente: verde al día, blanco
atrasada, gris sin dato. Esa fila es la que avisa cuando el panel está
mintiendo por viejo.

## Qué recalcula y qué no

Recalcula **números**: balances, costo de vida, conteo de skills, líneas,
series mensuales. Cuando cambia el conteo de skills lo propaga a los tres
textos que lo citan, cambiando solo el número y no la frase.

No recalcula **juicio**: los scores del radar, la etapa de cada área, el
estado de cada sistema y la lectura de cada pestaña se conservan tal como
están escritos.

**Los canales están excluidos del sync a propósito.** El campo `Canal
atribución` del CRM marca 8 leads como «Referido» y solo uno lo es (Emma
Clara, vía Seba Garrido por LinkedIn). Recalcular desde ahí volvería a
inventar un motor de referidos que no existe.

## Replicable

El panel lee un contrato de datos, no una persona. Para correrlo con otro
operador:

1. Copiar la carpeta y reemplazar el contenido de `<script id="pvt-data">`
   respetando las claves — la estructura es el contrato.
2. Apuntar `sync.py` a las fuentes de ese operador (su JSON financiero, su
   carpeta de skills, sus bases de Notion).
3. Ajustar `meta.os`, `meta.modulo` y `meta.operador`.

Todo lo demás — layout, glass, radar, semáforos, frescura — es genérico y
no toca datos de nadie.

---

## Plantilla para otros proyectos

`plantilla/index.html` es el mismo panel con el contrato de datos vacío: todas
las vistas, gráficos y estilos funcionando, sin un solo dato propio. Sirve para
levantar el panel de otro operador o de otro OS en minutos.

### Cómo se usa

1. Copiar `plantilla/index.html` al proyecto nuevo.
2. Abrir el bloque `<script id="pvt-data">` y llenar los campos. La estructura
   es el contrato: **respetar las claves**, cambiar solo los valores.
3. Ajustar `meta.os`, `meta.modulo` y `meta.operador`.
4. Copiar `.privatebuild/sync.py` y apuntarlo a las fuentes de ese proyecto.

### El contrato en una tabla

| Clave | Qué es |
|---|---|
| `meta` | Nombre del OS, módulo, operador y frescura de cada fuente |
| `radar.areas[]` | Las áreas del negocio. Llevan `v`/`t` (hoy/objetivo) y `falta[]` |
| `next.items[]` | Acciones concretas con área y plazo |
| `tendencia` | Series por período, costo en tiempo y diagnóstico por tramo |
| `comercial` | Ratios del ciclo, las dos series de plata y objeciones |
| `clientes` | Engagements, entrega, renovación y referidos |
| `canales` | Revenue por canal, origen y cadena de atribución |
| `contenido` | Motor, formatos, salidas y los tres territorios |
| `infra` | Escalera SOP→Skill→Sistema→Agente, inventario y gaps |
| `skills_area` | Qué skills operan cada vista |

### Convenciones que sostienen la lectura

- **Estados**: `live` corre · `mid` flojo · `brk` roto · `blind` a ciegas.
  Se usan igual en tiles, medidores, filas y bordes.
- **Una sola fuente por dato.** El radar se dibuja desde `radar.areas`, no desde
  una lista aparte: por eso el gráfico y la tabla no pueden desalinearse.
- **Cero y sin-dato no son lo mismo.** Cero se dibuja; sin dato va rayado.
- **El período en curso va translúcido**, nunca sólido: todavía puede crecer.
- **Conteos y dinero no comparten eje.** Son unidades distintas.
- Máximo dos líneas por párrafo. La conclusión de cada bloque va en `.concl`.
