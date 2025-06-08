WITH
  movie_counts AS (
    SELECT
      movieId,
      COUNT(*) AS cnt_ratings
    FROM
      `midyear-calling-460715-b8.ratings.ratings`
    GROUP BY
      movieId
  ),
  movies_sufficient AS (
    SELECT
      movieId
    FROM
      movie_counts
    WHERE
      cnt_ratings >= 2000
  )
SELECT
  (SELECT COUNT(*) FROM movie_counts WHERE cnt_ratings >= 2000) AS num_movies_ge_1000,
  (SELECT COUNT(*) FROM `midyear-calling-460715-b8.ratings.ratings` AS r
     JOIN movies_sufficient AS m
     ON r.movieId = m.movieId
  ) AS num_rows_ge_1000;

CREATE OR REPLACE TABLE
  `midyear-calling-460715-b8.ratings.ratings_2000` AS
WITH
  movie_counts AS (
    SELECT
      movieId,
      COUNT(*) AS cnt_ratings
    FROM
      `midyear-calling-460715-b8.ratings.ratings`
    GROUP BY
      movieId
  ),
  movies_sufficient AS (
    SELECT
      movieId
    FROM
      movie_counts
    WHERE
      cnt_ratings >= 2000
  )
SELECT
  r.userId,
  r.movieId,
  r.rating,
  r.timestamp
FROM
  `midyear-calling-460715-b8.ratings.ratings` AS r
JOIN
  movies_sufficient AS m
ON
  r.movieId = m.movieId;

