
# Cursitu v0.9 — Guía de Configuración para el Entorno Demo

Este documento detalla los pasos necesarios para desplegar el entorno local de **Cursitu**, una plataforma de aula virtual desarrollada para el Instituto Tecnológico Universitario de la Universidad Nacional de Cuyo. Esta versión está configurada específicamente como una **Demo Funcional**, ideal para explorar las características del sistema, interactuar con el aula virtual y realizar la carga inicial de datos de prueba.

---

## 1. Requisitos de Software

Antes de comenzar, asegurate de tener instaladas las siguientes herramientas en tu entorno local:

| Herramienta | Versión mínima | Descripción |
|---|---|---|
| Java JDK | 25 | Compilación y ejecución del ecosistema backend |
| Maven | 3.8+ | Gestor de dependencias del proyecto |
| MongoDB | — | Motor de base de datos no relacional para persistencia |
| IntelliJ IDEA | — | IDE recomendado para la ejecución y gestión del backend |
| Node.js + Angular CLI | — | Entorno necesario para levantar la interfaz frontend |

---

## 2. Preparación del Proyecto

### Clonar el repositorio

```bash
git clone https://github.com/NicolaIsGaray/cursituV2.git
```

### Configurar la base de datos

Para que la demo funcione de manera aislada y segura, el sistema requiere una variable de entorno para conectarse a MongoDB:

* **Nombre:** `MONGO_URI_TESTER`
* **Valor:** URL de conexión local o remota provista por el administrador del clúster.
* *Ejemplo local:* `mongodb://localhost:27017/cursitu_demo`

---

## 3. Ejecución del Backend (Java + Spring Boot)

1. Abrí IntelliJ IDEA y seleccioná la carpeta raíz del proyecto clonado.
2. Esperá a que Maven descargue e indexe todas las dependencias necesarias.
3. Navegá en el árbol de directorios hasta el archivo principal:
`src/main/java/pepedevelopers/cursitu/CursituApplication.java`
4. Hacé clic derecho sobre `CursituApplication.java` → **Run 'CursituApplication'**.
5. Verificá en la consola interna que el servicio se haya iniciado con el mensaje: `Started CursituApplication in X seconds`.

---

## 4. Ejecución del Frontend (Angular)

Con el servidor backend en ejecución, abrí una terminal nueva posicionada en la carpeta contenedora del archivo `package.json` y ejecutá los siguientes comandos:

```bash
# Instalar los paquetes y dependencias del cliente
npm install
```
```bash
# Levantar el servidor de desarrollo local
ng serve
```

Una vez que la compilación finalice con éxito, abrí tu navegador e ingresá a la plataforma desde: [http://localhost:4200](https://www.google.com/search?q=http://localhost:4200)

---

## 5. Notas para la Experiencia Demo

* **Llenado de Datos:** La base de datos asociada está completamente disponible para la creación de usuarios, asignación de materias, horarios y simulación de flujos reales dentro del aula virtual.
* **Persistencia Volátil:** Todos los datos generados durante la sesión de uso se almacenarán de forma local en la instancia definida en tu variable `MONGO_URI_TESTER`.
* **Trazabilidad:** Si experimentás algún comportamiento inesperado o error `500` en la interfaz, podés consultar la consola de IntelliJ IDEA para revisar los logs de depuración del servidor.