# ==========================================
# ETAPA 1: Construcción del Frontend (Angular)
# ==========================================
FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src/ ./src/
COPY angular.json tsconfig*.json set-env.js ./

ARG ANGULAR_API_URL
ENV ANGULAR_API_URL=$ANGULAR_API_URL

RUN npm run build:prod

# ==========================================
# ETAPA 2: Construcción del Backend (Spring Boot con Java 25)
# ==========================================
FROM maven:3.9.9-eclipse-temurin-25-alpine AS backend-build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src/ ./src/

RUN rm -rf src/main/resources/static/*

RUN mvn clean package -DskipTests

# ==========================================
# ETAPA 3: Entorno de Ejecución (Runtime)
# ==========================================
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
