# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

-------------------------------------------------------------------------------------------------------------------------
------------INSTALACION DEL PROYECTO-------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------


Requisitos Previos

Antes de ejecutar el proyecto, es necesario contar con:

Node.js (versión 18 o superior) y npm instalados.
Una cuenta de Google con acceso a Firebase Console (Plan Spark gratuito, sin necesidad de registrar tarjeta).
Firebase CLI instalado globalmente (necesario para el despliegue).

1. Instalación del Proyecto Local

Clonar este repositorio:

git clone https://github.com/IDGS-902-23001704/PWA-Tareas.git
cd "NOmbre de carpeta"


Instala todas las dependencias necesarias (React, Firebase, Lucide React y el plugin PWA):

npm install


2. Configuración de Firebase (Plan Spark)

Para conectar el proyecto con tu propia instancia de Firebase, sigue estos pasos en la consola:

A. Crear Proyecto y App Web

Ingresa a console.firebase.google.com y crea un proyecto nuevo en el plan gratuito Spark.
Ve a Configuración del proyecto (ícono de engrane) > General > selecciona el ícono Web (</>).
Registra la app y copia el objeto firebaseConfig.
Abre el archivo src/firebase.js en el proyecto y reemplaza las credenciales con las siguientes:

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD48WzU25D1EG-DwjdNQuda0L_RBELUiLw",
  authDomain: "practicafirebase-215b7.firebaseapp.com",
  projectId: "practicafirebase-215b7",
  storageBucket: "practicafirebase-215b7.firebasestorage.app",
  messagingSenderId: "1029004919658",
  appId: "1:1029004919658:web:3cfc2ac7795c7eeab8db13"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);


B. Configurar Firebase Authentication

En el menú lateral de Firebase, ve a Seguridad > Authentication > Sign-in method o metodo de acceso.
Habilita Correo electrónico/contraseña y guarda los cambios.
Agrega el proveedor Google, selecciona tu correo de asistencia del proyecto y guarda.

En la pestaña Configuración > Dominios autorizados, verifica que estén incluidos localhost y tus dominios de despliegue (*.web.app y *.firebaseapp.com).

C. Configurar Cloud Firestore y Reglas de Seguridad

Ve a BAses de datos > Firestore y crea la base de datos en modo de producción.

Dirígete a la pestaña Reglas y publica la siguiente configuración para proteger las tareas de cada usuario:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null
                    && request.auth.uid == resource.data.userId
                    && request.resource.data.userId == resource.data.userId;
    }
  }
}


3. Ejecución y Pruebas de la PWA

Modo Desarrollo
Para iniciar el servidor local con recarga en vivo (puerto 5173):
npm run dev


Modo Producción y Prueba de Instalación PWA

El Service Worker y la opción de instalación en el navegador se activan al compilar la aplicación. Asegúrate de tener los íconos pwa-192x192.png y pwa-512x512.png dentro de la carpeta public/ y ejecuta:

npm run build
npm run preview


Abre http://localhost:4173/ en Chrome o Edge y haz clic en el ícono de Instalar aplicación ubicado en la barra de direcciones.

4. Despliegue en Firebase Hosting

Instala las herramientas de línea de comandos de Firebase e inicia sesión:

npm install -g firebase-tools
firebase login


Inicializa Hosting en la raíz del proyecto (si aún no está configurado):

firebase init hosting

Selecciona tu proyecto existente de Firebase.
Define dist como directorio público (public directory).
Responde y (Sí) a configurar como Single-Page App (reescribir URLs a /index.html).
Compila la versión final y despliégala en la nube:

npm run build
firebase deploy