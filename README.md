# SmartGym Tracker

SmartGym Tracker es una plataforma digital orientada a gimnasios y usuarios, que permite registrar, analizar y mejorar el progreso físico mediante el uso de métricas, analítica y seguimiento continuo.

Este proyecto corresponde al desarrollo de un sistema funcional como parte del proyecto de título de Ingeniería en Computación e Informática.

---

## Descripción del proyecto

El sistema aborda la problemática de la baja digitalización en el seguimiento de entrenamientos en gimnasios, donde los métodos tradicionales dificultan la trazabilidad, el análisis del rendimiento y la adherencia del usuario.

SmartGym Tracker propone una solución basada en una arquitectura cliente-servidor, permitiendo centralizar la información de entrenamiento, generar métricas relevantes y mejorar la experiencia del usuario mediante datos.

---

## Funcionalidades principales

- Autenticación de usuarios mediante JWT
- Visualización de dashboard con métricas:
  - Score de rendimiento
  - Nivel de entrenamiento
  - Adherencia
  - Último entrenamiento
- Consumo de API REST
- Manejo de sesión mediante token
- Conexión entre frontend móvil y backend

---

## Arquitectura del sistema

El sistema se basa en una arquitectura cliente-servidor de tres capas:

- **Frontend móvil**: Aplicación desarrollada en React Native con Expo
- **Backend**: API REST desarrollada en Node.js con Express
- **Base de datos**: PostgreSQL

### Diagrama conceptual

<img width="419" height="832" alt="Captura de pantalla 2026-04-13 a la(s) 6 43 26 p m" src="https://github.com/user-attachments/assets/9b76711f-620e-4ba7-b901-de57c3704cc2" />
