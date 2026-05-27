# Cursitu v0.8 — Guía de Configuración para Testing Funcional

Este documento detalla los pasos necesarios para desplegar el entorno local de **Cursitu**, una plataforma de aula virtual desarrollada para el Instituto Tecnológico Universitario de la Universidad Nacional de Cuyo. Esta versión está preparada específicamente para las pruebas de integración y validación del equipo de QA.

---

## 1. Requisitos de Software

Antes de comenzar, asegurate de tener instaladas las siguientes herramientas:

| Herramienta | Versión mínima | Descripción |
|---|---|---|
| Java JDK | 25 | Compilación y ejecución del backend |
| Maven | 3.8+ | Gestor de dependencias del proyecto |
| MongoDB | — | Motor de base de datos no relacional |
| IntelliJ IDEA | — | IDE recomendado para ejecutar el backend |
| Node.js + Angular CLI | — | Necesarios para levantar el frontend |

---

## 2. Preparación del Proyecto

### Clonar el repositorio

```bash
git clone https://github.com/NicolaIsGaray/cursituV2.git
```

### Configurar la base de datos

El sistema requiere una variable de entorno para conectarse a MongoDB:

- **Nombre:** `MONGO_URI_TESTER`
- **Valor:** URL de conexión provista por el administrador del clúster
  - Ejemplo: `mongodb://localhost:27017/cursitu_test`

---

## 3. Ejecución del Backend (Java + Spring Boot)

1. Abrí IntelliJ IDEA y seleccioná la carpeta del proyecto clonado.
2. Esperá a que Maven descargue todas las dependencias (barra de progreso en la esquina inferior derecha).
3. Navegá hasta el archivo principal: src/main/java/pepedevelopers/cursitu/CursituApplication.java
4. Hacé clic derecho sobre `CursituApplication.java` → **Run 'CursituApplication'**.
5. Verificá en la consola el mensaje: Started CursituApplication in X seconds

---

## 4. Ejecución del Frontend (Angular)

Con el backend corriendo, abrí una nueva terminal en la carpeta donde se encuentre el archivo `package.json` y ejecutá:

```bash
npm install
```

```bash
ng serve
```

Una vez finalizado el proceso, accedé desde el navegador a: http://localhost:4200

---

## 5. Notas para el Tester

- **Persistencia:** Todos los datos creados durante las pruebas se almacenan en la base de datos definida en `MONGO_URI_TESTER`.
- **Logs:** Ante un error `500`, revisá la consola de IntelliJ para obtener el detalle técnico del fallo.