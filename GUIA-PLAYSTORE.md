# Subir BarberPro a Google Play Store

Esta guía te lleva paso a paso. La app es una **PWA**: para que aparezca en
Play Store hay que envolverla en una app Android (una "TWA"). Usamos
**PWABuilder**, que es un sitio web y no requiere instalar nada.

> ⏱️ Tiempo aproximado: 1–2 horas (sin contar la revisión de Google, que
> puede tardar de unas horas a unos días).
>
> 💵 Costo: **US$25 una sola vez** para la cuenta de desarrollador de Google.

---

## Paso 1 · Publicar la app en internet

La app tiene que estar online con una dirección `https://`.

1. Subí este proyecto a GitHub (si todavía no lo hiciste).
2. Entrá a [vercel.com](https://vercel.com) → **Add New → Project** → importá el repo.
3. Dejá todo como viene → **Deploy**.
4. Vercel te da una URL, por ejemplo `https://barberpro.vercel.app`.

📌 **Anotá esa URL.** La vas a usar en todos los pasos siguientes.

> Si querés un dominio propio (ej. `barberpro.com.ar`), configuralo ahora
> en Vercel → Settings → Domains. Cambiar el dominio **después** de publicar
> en Play Store obliga a regenerar el paquete.

---

## Paso 2 · Generar el paquete Android con PWABuilder

1. Entrá a [pwabuilder.com](https://www.pwabuilder.com).
2. Pegá la URL de tu app y apretá **Start**.
3. PWABuilder analiza la app y te muestra un puntaje. Tiene que decir que es
   instalable (el manifiesto y el service worker ya están listos en este repo).
4. Apretá **Package For Stores** → tarjeta **Android** → **Generate Package**.
5. En la ventana de opciones:
   - **Package ID**: dejá el que sugiere (algo como `app.vercel.barberpro`).
     📌 **Anotalo**, lo vas a necesitar en el Paso 3.
   - **App name**: `BarberPro`
   - **Signing key**: dejá **"Create new"** (PWABuilder crea la clave de firma).
6. Descargá el `.zip`.

El `.zip` contiene:
- `app-release-signed.aab` → el archivo que se sube a Play Store.
- `signing.keystore` y `signing-key-info.txt` → **tu clave de firma**.
- `assetlinks.json` → para verificar el dominio (Paso 3).

> ⚠️ **Guardá el `.zip` completo en un lugar seguro** (no solo en la compu).
> La `signing.keystore` y su contraseña son **irreemplazables**: si las
> perdés, no vas a poder publicar actualizaciones de la app nunca más.

---

## Paso 3 · Activar la verificación de dominio

Esto hace que la app abra a pantalla completa, sin la barra del navegador.

1. Abrí el `assetlinks.json` que vino en el `.zip` de PWABuilder. Adentro vas
   a ver un `package_name` y un `sha256_cert_fingerprints`.
2. En este proyecto, abrí el archivo
   [`public/.well-known/assetlinks.json`](public/.well-known/assetlinks.json)
   y reemplazá los dos textos `REEMPLAZAR_...` con esos valores reales.
3. Guardá, hacé commit y subí el cambio a GitHub. Vercel vuelve a publicar solo.
4. Para verificar: entrá en el navegador a
   `https://TU-URL/.well-known/assetlinks.json` y comprobá que se vea el
   contenido (no la app).

---

## Paso 4 · Crear la cuenta de Google Play Developer

1. Entrá a [play.google.com/console](https://play.google.com/console).
2. Registrate con tu cuenta de Google y pagá los **US$25** (pago único).
3. La verificación de identidad de Google puede tardar uno o dos días.

---

## Paso 5 · Subir la app a Play Console

1. En Play Console: **Crear app**.
   - Nombre: `BarberPro`
   - Idioma: Español
   - Tipo: App · Gratis
2. Menú lateral → **Producción** → **Crear nueva versión**.
3. Subí el archivo `app-release-signed.aab` del `.zip`.
4. Completá la ficha de la tienda (te lo va pidiendo Play Console):
   - Descripción corta y larga.
   - **Ícono** 512×512 → usá `public/icon-512.png` de este repo.
   - **Capturas de pantalla** del celular (mínimo 2) → sacalas abriendo la app.
   - Gráfico destacado 1024×500.
   - Clasificación de contenido, política de privacidad, datos de contacto.

---

## Paso 6 · Completar el `assetlinks.json` con la clave de Google

Cuando subís el `.aab`, Google le agrega **su propia firma** ("Play App
Signing"). Hay que sumar ese segundo fingerprint:

1. En Play Console → **Configuración → Integridad de la app** (App integrity).
2. Copiá el **SHA-256** de **"Certificado de firma de apps de Google Play"**.
3. Agregalo a `public/.well-known/assetlinks.json`, en la lista
   `sha256_cert_fingerprints`, separado por coma del que ya estaba:

   ```json
   "sha256_cert_fingerprints": [
     "FINGERPRINT_DE_PWABUILDER",
     "FINGERPRINT_DE_GOOGLE_PLAY"
   ]
   ```
4. Commit + push → Vercel redeploya.

---

## Paso 7 · Enviar a revisión

1. En Play Console, completá todo lo que aparezca con un punto rojo.
2. **Enviar para revisión.**
3. Google revisa la app (de unas horas a unos días). Cuando la aprueban,
   queda disponible para descargar en Play Store. 🎉

---

## Actualizar la app más adelante

- **Cambios en la web (textos, funciones, diseño):** se actualizan solos.
  La app de Play Store muestra siempre tu sitio; con hacer push a GitHub y
  que Vercel redeploye, los usuarios ven los cambios sin actualizar nada.
- **Cambios en la app Android** (ícono, nombre, permisos): hay que generar un
  `.aab` nuevo en PWABuilder **usando la misma `signing.keystore`** (en el
  Paso 2, en vez de "Create new", elegí "Use existing" y subí tu keystore),
  subir la versión nueva a Play Console y subir el número de versión.
