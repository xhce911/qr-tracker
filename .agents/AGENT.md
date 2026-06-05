# AGENT — QR Tracker Meta-Instructions

## Propósito de este archivo
Este documento es el **punto de entrada** para cualquier AI agent que trabaje en QR Tracker. Si solo puedes leer un archivo del contexto del proyecto, lee este.

## Workflow obligatorio
1. **Entender antes de actuar**: Lee `.agents/SOUL.md`, `.agents/TOOLS.md` y `.agents/MEMORY.md` antes de proponer cambios.
2. **Diseño antes de código**: Si el cambio afecta UI, lee `.agents/DESIGN.md`.
3. **Seguridad antes de todo**: Si ves una API key expuesta o un secret hardcodeado, detente y avisa.
4. **Build verification**: Tras cambios significativos (nuevos componentes, nuevas dependencias), corre `CI=true npm run build`.
5. **Consistencia**: Respeta los patrones existentes. Si todos los hooks están en `src/hooks/`, tu nuevo hook va ahí.

## Reglas de oro
| # | Regla | Prioridad |
|---|---|---|
| 1 | **NO tocar tests** salvo que sea necesario para que pasen tras un bugfix. | Crítica |
| 2 | **NO instalar globalmente** (`npm install -g`). Todo en `node_modules` local. | Crítica |
| 3 | **NO git mutations** (`commit`, `push`, `reset`, `rebase`) sin confirmación explícita. | Crítica |
| 4 | **NO ejectar CRA** sin discusión previa. | Alta |
| 5 | **NO instalar sub-paquetes de HeroUI** (`@heroui/spinner`, etc.). Usar `@heroui/react`. | Alta |
| 6 | **NO actualizar Tailwind a v4**. El proyecto está bloqueado en v3.4.x. | Alta |
| 7 | **NO hardcodear secrets**. Usar variables de entorno (`REACT_APP_*`). | Alta |
| 8 | **Traducir errores de Firebase** al español en `useAuth.js`. | Media |
| 9 | **Mobile-first** en todo componente nuevo. | Media |

## Manejo de errores comunes
| Síntoma | Causa probable | Solución rápida |
|---|---|---|
| `ChunkLoadError: node_modules_heroui_dom-animation` | Webpack code-split falla en dev | `import '@heroui/dom-animation';` en `src/index.js` |
| `Can't resolve '@heroui/spinner'` | Paquete individual no existe/peer dep roto | Importar desde `@heroui/react` |
| `getAnalytics` crash en localhost | Firebase Analytics requiere dominio real | `try/catch` en `firebase.js` |
| `auth/invalid-credential` | Email/pass incorrectos | Mensaje amigable en español |
| Build infinito / out of memory | Caché corrupta de webpack | `rm -rf node_modules/.cache` |

## Comunicación con el usuario
- Explica el **problema raíz**, no solo el síntoma.
- Ofrece **2-3 opciones** cuando hay decisiones arquitectónicas.
- Usa español para la conversación, inglés para nombres de variables/funciones.
- Si algo falla, pide los logs exactos de la consola del navegador o del terminal.

## Multi-AI Compatibility
Este archivo y los de `.agents/` están escritos en Markdown estándar para ser interpretados por:
- **Cursor** (vía `.cursor/rules/*.mdc`)
- **OpenCode** (vía `.opencode/agents/*.md`)
- **Claude Code** (vía `.claude/CLAUDE.md`)
- **Codex** (vía `.codex/instructions.md`)

Cada plataforma tiene su archivo de bridge en su respectiva carpeta oculta.
