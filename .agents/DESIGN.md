# DESIGN — QR Tracker

## Sistema de diseño
**HeroUI v2.7** (basado en React Aria + Tailwind). Usamos la distribución monolítica `@heroui/react`, NO paquetes individuales (evitan conflictos de peer dependencies con Tailwind v3).

## CSS Custom Properties
El proyecto usa variables CSS definidas en `src/index.css`:
```css
--bg-page   /* fondo general */
--text      /* texto principal */
--text-muted/* texto secundario */
--accent    /* color de marca */
--border    /* bordes y separadores */
```

## Componentes principales
| Componente | Origen | Uso |
|---|---|---|
| Modal | `@heroui/react` | AuthModal (login/register) |
| Navbar | `@heroui/react` | Navegación superior |
| Tabs | `@heroui/react` | Switch login/register |
| Input | `@heroui/react` | Formularios |
| Button | `@heroui/react` | Acciones primarias/secundarias |
| Avatar | `@heroui/react` | Menú de usuario |
| Dropdown | `@heroui/react` | Logout |
| Spinner | `@heroui/react` | Estados de carga (importar desde `@heroui/react`, NO `@heroui/spinner`) |
| Card | `@heroui/react` | Dashboard, listados |

## Iconografía
- **Heroicons** (`@heroicons/react`) — UI general
- **react-icons** (`hi`, `fc`) — Navbar, Google login

## Layout
- **Container**: `max-w-6xl mx-auto px-4`
- **Navbar**: fijo, `backdrop-blur`, borde inferior sutil
- **Mobile-first**: Todos los componentes deben verse bien en < 640px.

## Animaciones
- HeroUI usa internamente `framer-motion` v12 a través de `@heroui/dom-animation`.
- **CRÍTICO**: Si webpack intenta code-split `dom-animation` y falla, importar explícitamente en `src/index.js`:
  ```js
  import '@heroui/dom-animation';
  ```

## Tailwind
- Versión **3.4.x** (bloqueado, NO actualizar a v4).
- Configuración en `tailwind.config.js` incluye el path de HeroUI theme.
- No uses clases arbitrarias excesivas; preferir estilos en `index.css` para patrones repetidos.
