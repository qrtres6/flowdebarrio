# Flow de Barrio · Barber Shop

App de cobro y gestión para Flow de Barrio.

## Cómo subirlo a internet (paso a paso)

### 1. Subir el código a GitHub
1. Andá a [github.com/new](https://github.com/new) (logueate con `qrtres6`)
2. Nombre del repo: `flow-de-barrio`
3. Que sea **Public**
4. NO marques "Add README"
5. Clic en **Create repository**

### 2. Subir los archivos
Te aparece una pantalla con instrucciones. La opción más fácil:
- Clic en **"uploading an existing file"** (link azul en el medio)
- Arrastrá TODOS los archivos de este proyecto al recuadro
- Abajo, "Commit changes"

### 3. Conectar Vercel (gratis, sin tarjeta)
1. Andá a [vercel.com/signup](https://vercel.com/signup)
2. Clic en **"Continue with GitHub"** (con `qrtres6`)
3. Una vez adentro: **Add New** → **Project**
4. Buscá `flow-de-barrio` → **Import**
5. Dejá todo como viene → **Deploy**
6. Esperá 30 segundos. Te da una URL tipo `flow-de-barrio.vercel.app`

### 4. Probar en el celular
1. Abrí la URL en Chrome del celular
2. Te sale un cartel "Instalar app" (o menú ⋮ → "Instalar"/"Agregar a pantalla de inicio")
3. ✅ Listo, aparece como una app más en el celu

## Archivos importantes
- `index.html` — pantalla de inicio (Cobro / Admin)
- `cobro.html` — app del empleado
- `admin.html` — panel del dueño
- `manifest.webmanifest` — config para que sea instalable
- `sw.js` — service worker (funciona offline)

## Estado actual
✅ PWA instalable
⏳ Datos solo en este celu (próximo paso: Supabase)
