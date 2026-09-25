# Requisitos

Node.js (versión compatible con Expo SDK 57 y React 19 — se recomienda Node 20 o superior)
pnpm
TypeScript ~6.0.3
Expo CLI 
App Expo Go instalada en un celular físico, o un emulador Android / simulador iOS configurado
El backend (API + sockets) corriendo y accesible en la red
# Instalacion y ejecucion

Clonar el repositorio del frontend
Ejecutar pnpm install desde la carpeta raíz del proyecto para instalar todas las dependencias
Verificar que el backend (servidor + base de datos + sockets) ya esté corriendo y accesible en esas URLs antes de levantar el frontend
ejecutar pnpm expo start
Desde la terminal que se abre:
Escanear el código QR con la app Expo Go para probar en un celular físico, o
Ejecutar pnpm run android para abrir en un emulador Android, o
Ejecutar pnpm run ios para abrir en un simulador iOS (solo en Mac)

También es posible ejecutar la aplicación en un navegador con pnpm web
Puedes iniciar el servidor limpiando la caché con pnpm exec expo start -c
