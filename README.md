# Centro de mando · Next.js

Tu app de Centro de mando (RPG de estudio, roadmap, repaso, contextos, analizador
de vacantes y portafolio) migrada a **Next.js (App Router + TypeScript)** con
**sincronización en la nube** mediante una API route respaldada por **Upstash Redis**.

## Qué cambió respecto al HTML original

- Toda tu lógica y tu diseño se conservan **idénticos**. El markup vive en
  `app/central-command.markup.ts` y la lógica original en `app/central-command.app.ts`,
  que se ejecuta una sola vez en el cliente.
- Tu capa de sync ahora apunta por defecto a `/api/sync` (misma app), así que
  **ya no necesitas pegar una URL**: basta con tu *código de sync*.
- `app/api/sync/route.ts` implementa el contrato que tu cliente ya usaba:
  - `POST /api/sync` con `{ code, data, updated_at }` → guarda en Redis.
  - `GET /api/sync?code=XXX` → devuelve `{ data, updated_at }`.

## Correr en local

```bash
npm install
cp .env.local.example .env.local   # pega tus llaves de Upstash para probar sync en local
npm run dev                        # http://localhost:3000
```

Si no pones las llaves, la app funciona igual (todo se guarda en localStorage);
solo el sync en la nube queda inactivo hasta que las configures.

## Desplegar en Vercel

1. Sube este proyecto a tu repo `eduardecheverria/centralCommand` (o el que prefieras):
   ```bash
   git add .
   git commit -m "Migrar Centro de mando a Next.js + Upstash sync"
   git push
   ```
2. En Vercel, importa el repo (o si ya está, el push redepliega solo).
3. La integración de Upstash que ya conectaste inyecta `KV_REST_API_URL` y
   `KV_REST_API_TOKEN` automáticamente. No tienes que pegarlas a mano.
4. Abre tu app desplegada → engranaje ⚙️ → escribe un **código de sync**
   (el mismo en todas tus computadoras) → "Guardar y sincronizar ahora".

## Estructura

```
app/
  layout.tsx                 raíz + fuentes + metadata
  globals.css                tu CSS original
  page.tsx                   renderiza el client island
  central-command.tsx        client component (inyecta markup + arranca lógica)
  central-command.markup.ts  markup original (string)
  central-command.app.ts     lógica original (vanilla JS, sin tipar)
  api/sync/route.ts          endpoint de sync (Upstash Redis)
lib/
  redis.ts                   cliente de Redis (lee las env de Upstash)
```

## Nota sobre el siguiente paso (opcional)

Esta migración mantiene tu código vanilla intacto dentro de Next.js, que es lo
que necesitas para desplegar ya con sync real. Si más adelante quieres
**componentizar** cada módulo (RPG, roadmap, etc.) como componentes React con
hooks y estado, es un trabajo aparte más grande — pero excelente práctica de cara
a entrevistas. Cuando quieras, lo hacemos por partes.
