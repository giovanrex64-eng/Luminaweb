# Despliegue en Netlify (instrucciones rápidas)

Estas son las instrucciones y comandos útiles para preparar el repositorio y desplegar en Netlify.

IMPORTANTE: no subas claves secretas en `.env` al repositorio. Si ya las subiste, rótalas y elimínalas del historial.

1) Preparar el repositorio (quitar `.env` y no subir `dist`)

```powershell
# Elimina .env del control de versiones y añade a .gitignore
git rm --cached .env
echo .env >> .gitignore
git add .gitignore

# Si `dist` está comiteado, eliminarlo del control de versiones
git rm -r --cached dist || echo "dist not tracked"
echo dist >> .gitignore
git add .gitignore

# Añade y commitea cambios de código (index.html, package.json, docs, etc.)
git add index.html package.json ENVIOS_CONFIG.md
git commit -m "fix: relative entry path and netlify dev script/docs; remove .env from repo"
git push origin $(git rev-parse --abbrev-ref HEAD)
```

2) Agregar variables en Netlify (producción)

- En Netlify Dashboard → Site → Settings → Build & deploy → Environment → Environment variables:
  - `ENVIA_API_KEY` (o `ENVIA_ACCESS_TOKEN`)
  - `MP_ACCESS_TOKEN`

3) Alternativa: publicar `dist` sin tocar el repo (Netlify CLI)

```powershell
npm run build
netlify deploy --prod --dir=dist
```

4) Probar localmente (Netlify CLI)

```powershell
npm install -g netlify-cli
npm run netlify:dev
# abre http://localhost:8888 para ver frontend y llamar a /.netlify/functions/*
```

5) Seguridad: si `.env` se hizo público

- Rota las claves en Envia.com y MercadoPago inmediatamente.
- Para eliminar las claves del historial git (opcional, avanzado) usa BFG o `git filter-branch`.

6) Notas rápidas

- Netlify hace `npm run build` y publica la carpeta `dist` por `netlify.toml`.
- Mejor práctica: subir código fuente y dejar que Netlify haga el build.

Si quieres, puedo:
- Generar un `README`/sección en el `README.md` en lugar de este archivo.
- Guiarte paso a paso para ejecutar los comandos en tu máquina.
