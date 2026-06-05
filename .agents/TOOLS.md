# TOOLS — QR Tracker Stack

## Core
| Herramienta | Versión | Notas |
|---|---|---|
| React | 19.1.0 | Functional components + hooks |
| react-dom | 19.1.0 | createRoot |
| react-scripts | 5.0.1 | CRA. No ejectado. Webpack interno. |
| react-router-dom | 7.6.2 | Routing declarativo |

## UI / Estilo
| Herramienta | Versión | Notas |
|---|---|---|
| @heroui/react | 2.7.10 | Importar todo desde aquí. NO instalar sub-paquetes. |
| tailwindcss | 3.4.19 | v3 obligatoria. v4 rompe peer deps. |
| framer-motion | 12.18.1 | HeroUI lo usa internamente. |
| @heroicons/react | 2.2.0 | Iconos outline/solid |
| react-icons | 5.5.0 | Iconos de terceros (Google, etc.) |
| flat-color-icons | 1.1.0 | Iconos de colores planos |

## Backend / Infra
| Herramienta | Versión | Notas |
|---|---|---|
| firebase | 11.9.1 | Auth, Firestore, Functions, Analytics |

## Utilidades
| Herramienta | Versión | Uso |
|---|---|---|
| qrcode.react | 4.2.0 | Generación de códigos QR en canvas/PNG |
| web-vitals | 2.1.4 | Métricas Core Web Vitals |

## Scripts disponibles
```bash
npm start      # Dev server en localhost:3000
npm run build  # Build de producción
npm test       # Tests con Jest
```

## Estructura de archivos clave
```
src/
  App.js                 # Router + HeroUIProvider
  index.js               # Entry point (dom-animation import aquí si es necesario)
  firebase.js            # Config e inicialización de Firebase
  hooks/
    useAuth.js           # Hook de autenticación
  components/
    AuthModal.js         # Login/Register modal
    Navbar.js            # Navegación + menú usuario
    QRGenerator.js       # Crear QR
    QRScanner.js         # Leer/escanear QR
    Dashboard.js         # Panel de analytics
    ScanHistory.js       # Detalle de escaneos por QR
public/
build/                   # Output de producción
```

## Comandos útiles
```bash
# Verificar build limpio
CI=true npm run build

# Limpiar caché de webpack si hay chunk errors
rm -rf node_modules/.cache

# Reinstalar todo
rm -rf node_modules package-lock.json && npm install
```
