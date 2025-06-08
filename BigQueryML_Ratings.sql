DROP ASSIGNMENT
`midyear-calling-460715-b8.region-eu.mf-reservation.assignment1`;

DROP RESERVATION
`midyear-calling-460715-b8.region-eu.mf-reservation`;

CREATE RESERVATION
  `midyear-calling-460715-b8.region-eu.mf-reservation`
OPTIONS (
  slot_capacity = 50
);


CREATE ASSIGNMENT
  `midyear-calling-460715-b8.region-eu.mf-reservation.assignment1`
OPTIONS (
  assignee = "projects/midyear-calling-460715-b8",
  job_type = "QUERY"
);

-- ======================================================
-- 1) CONTAR CUÁNTAS FILAS, PELÍCULAS Y USUARIOS HAY
-- ======================================================
SELECT
  COUNT(*)               AS total_rows,
  COUNT(DISTINCT movieId) AS unique_movies,
  COUNT(DISTINCT userId)  AS unique_users
FROM
  `midyear-calling-460715-b8.ratings_eu.ratings_2000`;

-- ======================================================
-- 2) CREAR MODELO DE EVALUACIÓN 90/10 (MATRIX_FACTORIZATION)
-- ======================================================
CREATE OR REPLACE MODEL
  `midyear-calling-460715-b8.ratings_eu.mf_model_ratings2000_eval`
OPTIONS (
  model_type                 = 'MATRIX_FACTORIZATION',
  user_col                   = 'userId',
  item_col                   = 'movieId',
  rating_col                 = 'rating',
  num_factors                = 50,
  l2_reg                     = 0.02,
  max_iterations             = 10,
  feedback_type              = 'EXPLICIT',
  data_split_method          = 'RANDOM',
  data_split_eval_fraction   = 0.10
) AS
SELECT
  userId,
  movieId,
  rating
FROM
  `midyear-calling-460715-b8.ratings_eu.ratings_2000`;

-- ======================================================
-- 3) OBTENER MÉTRICAS DE EVALUACIÓN (RMSE, MAE)
-- ======================================================
SELECT
  *
FROM
  ML.EVALUATE(
    MODEL `midyear-calling-460715-b8.ratings_eu.mf_model_ratings2000_eval`
  );

-- ======================================================
-- 4) CREAR MODELO FINAL SIN SPLIT (NO_SPLIT)
--    (DESCOMENTA SI LO NECESITAS)
-- ======================================================
-- CREATE OR REPLACE MODEL
--   `midyear-calling-460715-b8.ratings.mf_model_ratings2000`
-- OPTIONS (
--   model_type        = 'MATRIX_FACTORIZATION',
--   user_col          = 'userId',
--   item_col          = 'movieId',
--   rating_col        = 'rating',
--   num_factors       = 50,
--   l2_reg            = 0.02,
--   learn_rate        = 0.005,
--   max_iterations    = 10,
--   feedback_type     = 'EXPLICIT',
--   data_split_method = 'NO_SPLIT'
-- ) AS
-- SELECT
--   userId,
--   movieId,
--   rating
-- FROM
--   `midyear-calling-460715-b8.ratings.ratings_2000`;

-- ======================================================
-- 5) EXPORTAR EL MODELO A Cloud Storage COMO TensorFlow SavedModel
--    (DESCOMENTA Y AJUSTA gs://TU_BUCKET_TF/ SEGÚN TU BUCKET)
-- ======================================================
-- EXPORT MODEL
--   `midyear-calling-460715-b8.ratings.mf_model_ratings2000`
-- OPTIONS (
--   uri    = 'gs://TU_BUCKET_TF/modelo_mf_2000/',
--   format = 'tf_saved_model'
-- );

-- ======================================================
-- 6) PEDIR TOP-30 RECOMENDACIONES PARA userId = 53
-- ======================================================
SELECT
  recs.movieId,
  recs.predicted_rating
FROM
  ML.RECOMMEND(
    MODEL `midyear-calling-460715-b8.ratings_eu.mf_model_ratings2000`,
    (
      SELECT DISTINCT userId
      FROM `midyear-calling-460715-b8.ratings_eu.ratings_2000`
      WHERE userId = 53
    ),
    STRUCT(30 AS num_recommendations)
  ) AS recs;
