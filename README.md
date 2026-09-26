# Requisitos

1. Node.js (versión compatible con Expo SDK 57 y React 19 — se recomienda Node 20 o superior)
2. pnpm
3. TypeScript ~6.0.3
4. Expo CLI
5. App Expo Go instalada en un celular físico, o un emulador Android / simulador iOS configurado
6. El backend (API + sockets) corriendo y accesible en la red

# Instalacion y ejecucion

1. Clonar la rama prod del repositorio
2. Ejecutar pnpm install desde la carpeta raíz del proyecto para instalar todas las dependencias
3. Verificar que el backend (servidor + base de datos + sockets) ya esté corriendo y accesible en esas URLs antes de levantar el frontend
4. ejecutar pnpm expo start
   Desde la terminal que se abre:
5. Escanear el código QR con la app Expo Go para probar en un celular físico, o
6. Ejecutar pnpm run android para abrir en un emulador Android, o
7. Ejecutar pnpm run ios para abrir en un simulador iOS (solo en Mac)

También es posible ejecutar la aplicación en un navegador con pnpm web
Puedes iniciar el servidor limpiando la caché con pnpm exec expo start -c
