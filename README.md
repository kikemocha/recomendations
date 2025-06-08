# Recomendador de Películas

Este repositorio contiene la implementación de un sistema de recomendaciones de películas basado en filtrado colaborativo (kNN), factorización matricial (SVD) y embeddings. Incluye tanto la parte de back-end (procesamiento de datos, entrenamiento de modelos, funciones cloud) como el front-end de la aplicación.

---

## 📁 Estructura del Proyecto

```
├── cloud_functions/           # Funciones desplegadas en la nube (Google Cloud Functions)
│   ├── get_history.py        # Devuelve el historial de valoraciones de un usuario
│   ├── get_movies.py         # Lista películas y metadatos
│   └── get_recommendations.py# Punto de entrada para generar recomendaciones via kNN o SVD
│
├── data/                     # Datos estáticos
│   └── ~.lock.movies_metadata.csv # Metadatos de películas (fichero de bloqueo)
│
├── front/                    # Aplicación web en React para visualizar el sistema de recomendación
│   ├── public/               # Archivos estáticos (favicon, assets, etc.)
│   └── src/                  # Código fuente en React (JS/TS, componentes, estilos)
│
├── notebooks/                # Cuadernos Jupyter para exploración y entrenamiento
│   ├── get_embeddings.ipynb  # Generación de embeddings de películas
│   ├── get_img.ipynb         # Procesado y descarga de imágenes de carátulas
│   ├── knn_model.ipynb       # Entrenamiento y validación de modelo kNN
│   ├── SVD_ratings_small.ipynb# Implementación de SVD en subconjunto de datos
│   ├── main.ipynb            # Pipeline completo de pre-procesado y recomendaciones
│   └── migrate_GCP.ipynb     # Migración y carga de datos a Google Cloud Platform
│
├── sql/                      # Scripts para BigQuery y consultas SQL
│   ├── BigQueryML_Ratings.sql# Entrenamiento de modelos en BigQuery ML
│   └── ratings-2000.sql      # Importación y filtrado de ratings (>=2000 votos)
│
├── README.md                 # Documentación principal (este fichero)
├── package.json              # Dependencias y scripts del front-end
├── tsconfig*.json            # Configuración TypeScript
└── vite.config.ts            # Configuración de Vite
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js ≥ 16
- Python ≥ 3.8 y pip
- Google Cloud SDK (para desplegar funciones)
- Acceso a BigQuery (opcional)

### Instalación del Front-end

```bash
cd front
npm install
npm run dev      # Levanta servidor en http://localhost:5173
```

### Entrenamiento de Modelos y Procesado de Datos

1. Crear y activar un entorno virtual:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Ejecutar los notebooks en orden:
   - `ratings-2000.sql` para cargar y filtrar valoraciones.
   - `migrate_GCP.ipynb` para subir datos a GCP (opcional).
   - `knn_model.ipynb` o `SVD_ratings_small.ipynb` según el enfoque.
   - `get_embeddings.ipynb` y `get_img.ipynb` para enriquecer con embeddings e imágenes.
   - `main.ipynb` para orquestar todo el pipeline.

### Despliegue de Cloud Functions

1. Autenticar GCP: `gcloud auth login`
2. Seleccionar proyecto: `gcloud config set project YOUR_PROJECT_ID`
3. Desplegar cada función:
   ```bash
   gcloud functions deploy get_history     --runtime python39 --trigger-http --allow-unauthenticated
   gcloud functions deploy get_movies      --runtime python39 --trigger-http --allow-unauthenticated
   gcloud functions deploy get_recommendations --runtime python39 --trigger-http --allow-unauthenticated
   ```

---

## 💡 Flujo de Recomendación
1. El cliente (front-end) solicita recomendaciones para un `userId`.
2. La función `get_recommendations` recibe la petición y carga el modelo (kNN o SVD).
3. Se invoca la función `recommend_knn` o su análogo SVD para generar un vector de scores.
4. Se filtran las películas ya vistas y se devuelven los `n` IDs con mayor puntuación.
5. El front-end consulta metadatos (`get_movies`) para mostrar título, carátula y sinopsis.

---

## 🔧 Contribuciones
¡Las contribuciones son bienvenidas! Por favor, abre un _issue_ o un _pull request_ con mejoras:
- Nuevas métricas de evaluación
- Optimización del pipeline de datos
- Integración de métodos híbridos o basados en contenido

---

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Consulta el fichero `LICENSE.md` para más detalles.
