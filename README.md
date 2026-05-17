# Flow de Barrio · Barber Shop

App de cobro y gestión para Flow de Barrio, hecha con **Vite + React** y
**Supabase** para sincronizar los datos entre dispositivos.

- **Inicio** (`/`) — elegís entrar a Cobro o Admin.
- **Cobro** (`/cobro`) — pantalla del empleado: iniciar turno, cobrar servicios y cerrar caja.
- **Admin** (`/admin`) — panel del dueño: panel, reportes, gastos, servicios, empleados y configuración.

Es una **PWA**: se puede instalar en el celular como una app más.

## Cómo correrlo en tu compu

```bash
npm install
npm run dev      # abre http://localhost:5173
npm run build    # genera la carpeta dist/ para publicar
```

## Subirlo a internet (Vercel)

1. Subí este repo a GitHub.
2. Entrá a [vercel.com](https://vercel.com) → **Add New → Project** → importá el repo.
3. Vercel detecta Vite solo. Dejá todo como viene y **Deploy**.
4. En unos segundos te da una URL tipo `flow-de-barrio.vercel.app`.

## Sincronizar datos entre celulares (Supabase)

Sin esto, la app funciona igual pero los datos quedan **solo en cada
dispositivo**. Para que el cobro y el admin compartan la misma información:

1. Creá una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. En el proyecto: **SQL Editor → New query**, pegá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y apretá **Run**.
3. En **Settings → API** copiá el **Project URL** y la **anon public key**.
4. Cargá esos dos valores como variables de entorno:
   - En local: copiá `.env.example` como `.env` y completalo.
   - En Vercel: **Settings → Environment Variables**, agregá
     `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, y volvé a deployar.

El indicador de la barra superior muestra el estado: *Sincronizado*,
*Sincronizando…*, *Sin conexión* o *Solo este dispositivo*.

> **Nota de seguridad:** la app no tiene login de usuarios; usa la clave
> pública (anon key) y una sola fila compartida. Es práctico para una
> peluquería, pero la contraseña de admin se guarda dentro de esa fila.
> Cambiá la contraseña por defecto (`flow2026`) desde **Admin → Configuración**.

## Estructura del proyecto

```
index.html            entrada de Vite
src/
  main.jsx            router (/, /cobro, /admin)
  pages/              Home, Cobro, Admin
  components/         SyncBadge
  lib/                store, supabase, theme, icons, formatos, constantes
public/               iconos, logos, manifest.webmanifest, sw.js
supabase/schema.sql   tabla para Supabase
design-handoff/       prototipo estático original (referencia de diseño)
```

## Publicar en Google Play Store

La app se puede subir a Play Store envolviéndola como app Android (TWA).
El paso a paso está en [`GUIA-PLAYSTORE.md`](GUIA-PLAYSTORE.md).

## Estado actual

- ✅ PWA instalable
- ✅ Cobro, Admin y reportes funcionando
- ✅ Sincronización opcional con Supabase (tiempo real entre dispositivos)
- ✅ Lista para empaquetar y subir a Google Play Store
