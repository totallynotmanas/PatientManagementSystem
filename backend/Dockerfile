# STAGE 1: Build the JAR file
# We use a Maven image to compile the code
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the dependency file first (for better caching)
COPY Backend/pom.xml .
# Download dependencies (this step is cached if pom.xml doesn't change)
RUN mvn dependency:go-offline

# Copy the rest of your source code
COPY Backend/src ./src

# Build the app (Skip tests to speed up the first build)
RUN mvn clean package -DskipTests

# STAGE 2: Run the App
# We use a lightweight JRE image just to run the compiled code
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the 'build' stage
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]