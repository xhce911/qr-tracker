# MEMORY — QR Tracker Contexto Persistente

## Decisiones arquitectónicas
1. **CRA no Vite**: El proyecto usa Create React App (`react-scripts`). No se migra a Vite/Astro sin discusión previa.
2. **Firebase v11 modular**: Usamos la API modular (`firebase/auth`, `firebase/firestore`), NO la API namespace (`firebase.auth()`).
3. **HeroUI monolítico**: Importar componentes desde `@heroui/react`. Los sub-paquetes (`@heroui/spinner`, etc.) pueden traer peer dependencies incompatibles con Tailwind v3.
4. **Tailwind v3 bloqueado**: `@heroui/theme` requiere `tailwindcss >= 3.4.0 < 4.0.0`. No actualizar a Tailwind 4.

## Patrones de código establecidos
### Autenticación
- `useAuth` hook centraliza todo: `onAuthStateChanged`, login email/pass, login Google, register, logout.
- Los errores de Firebase Auth se traducen al español en `useAuth.js`.
- `AuthModal` usa tabs (login / register) con validación cliente antes de enviar.

### Routing protegido
- `/dashboard` y `/dashboard/scans/:qrId` redirigen a `/` si no hay usuario autenticado.
- `/scan/:qrId` es público (cualquiera puede escanear).

### Firebase Auth
- Email/password y Google Sign-In están implementados.
- `GoogleAuthProvider` con `prompt: 'select_account'` para forzar elección de cuenta.

### Manejo de errores conocidos
- **`ChunkLoadError` de `@heroui/dom-animation`**: Solución — importar explícitamente en `src/index.js`:
  ```js
  import '@heroui/dom-animation';
  ```
- **`getAnalytics` falla en localhost**: Solución — envolver en try-catch en `firebase.js`.

## Estado actual del proyecto
- Login/Register funcional con HeroUI Modal.
- Navbar con menú desplegable de usuario y logout.
- Generador de QR (`qrcode.react`) en página principal.
- Dashboard con listado de QRs del usuario.
- Historial de escaneos por QR individual.
- **Project Supervisor** configurado en OpenCode como `default_agent` para supervisión automática al iniciar sesiones.
- Documentación de proceso creada: `PROJECT_STATUS.md`, `CHANGELOG.md`, `DECISIONS.md`.

## Incidentes / Lecciones aprendidas
### 2026-05-25 — react-scripts corrompido a ^0.0.0
- **Síntoma:** `npm outdated` mostró `react-scripts` en `0.0.0`, una versión inexistente.
- **Causa:** Cambio accidental (o por agente externo) en `package.json`: `"react-scripts": "5.0.1"` → `"react-scripts": "^0.0.0"`.
- **Impacto:** El proyecto no podía compilar ni iniciar en desarrollo.
- **Solución:** Revertir a `"react-scripts": "5.0.1"` (sin `^`, pinned) y ejecutar `npm install`.
- **Prevención:** El Project Supervisor ahora revisa `package.json` como parte del flujo de inicio. Nunca confiar en que `npm install` funcionará sin verificar `npm outdated` primero.

## Reglas de negocio
- Solo usuarios autenticados pueden crear QRs y ver su dashboard.
- Los QRs públicos (`/scan/:qrId`) registran un hit en Firestore antes de redirigir.
- Un QR puede ser editado o eliminado solo por su creador.
