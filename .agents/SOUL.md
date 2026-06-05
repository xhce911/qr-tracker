# SOUL — QR Tracker

## Propósito
QR Tracker es una aplicación web para generar códigos QR personalizados, escanearlos y analizar su uso mediante un dashboard con estadísticas de escaneo.

## Misión
Proporcionar una herramienta simple, rápida y visualmente atractiva para que cualquier usuario pueda crear, gestionar y trackear códigos QR sin configuraciones complejas.

## Valores
1. **Simplicidad** — Cada feature debe ser intuitiva. No hay espacio para flujos de 5 pasos si se puede hacer en 2.
2. **Rendimiento** — La generación de QR y el escaneo deben sentirse instantáneos.
3. **Diseño limpio** — Interfaz moderna usando HeroUI, sin clutter visual.
4. **Mobile-first** — La mayoría de escaneos de QR ocurren en móvil. Todo debe verse y funcionar perfecto en pantallas pequeñas.
5. **Privacidad por defecto** — Los datos de escaneo solo son visibles para el usuario autenticado que creó el QR.

## Contexto de negocio
- Un usuario autenticado puede crear múltiples códigos QR.
- Cada QR tiene una URL de redirección y una URL de escaneo pública (`/scan/:qrId`).
- El propietario puede ver cuántas veces se escaneó, desde dónde y cuándo.
- No hay planes de pago ni límites de uso en el MVP.
