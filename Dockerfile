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
# ETAPA 2: Construcción del Backend
# ==========================================
FROM eclipse-temurin:25-jdk-alpine AS backend-build
WORKDIR /app

RUN apk add --no-cache maven

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src/ ./src/

RUN rm -rf src/main/resources/static/*

COPY --from=frontend-build /app/src/main/resources/static/ src/main/resources/static/

RUN mvn clean package -DskipTests

# ==========================================
# ETAPA 3: Entorno de Ejecución (Runtime)
# ==========================================
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT:8080}", "-Dhttps.protocols=TLSv1.2,TLSv1.3", "-jar", "app.jar"]
