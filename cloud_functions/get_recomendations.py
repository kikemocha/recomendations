import os
from flask import jsonify, make_response, request
import functions_framework
from google.cloud import bigquery
import pymysql
from pymysql.cursors import DictCursor

client = bigquery.Client()

def get_mysql_connection():
    return pymysql.connect(
        host='35.241.209.88',
        user='root',
        password="#\\5.Go~{3Z^1*6.y",
        db='recomendacion',
        charset='utf8mb4',
        cursorclass=DictCursor
    )


def fetch_movie_details(movie_ids):
    """
    Dado un listado de IDs, devuelve los registros completos de la tabla `movies`.
    """
    conn = get_mysql_connection()
    try:
        with conn.cursor() as cur:
            placeholders = ",".join(["%s"] * len(movie_ids))
            sql = f"SELECT * FROM movies WHERE id_movie IN ({placeholders})"
            cur.execute(sql, movie_ids)
            return cur.fetchall()
    finally:
        conn.close()


@functions_framework.http
def get_recommendations(request):
    if request.method == 'OPTIONS':
        return ('', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })

    try:
        # Obtener userId de la query string
        user_id = request.args.get('userId')
        if not user_id:
            return make_response(
                jsonify({"error": "Falta el parámetro 'userId' en la URL"}), 400,
                {'Access-Control-Allow-Origin': '*'}
            )
        try:
            user_id_int = int(user_id)
        except ValueError:
            return make_response(
                jsonify({"error": "El parámetro 'userId' debe ser un entero"}), 400,
                {'Access-Control-Allow-Origin': '*'}
            )

        # Construir la consulta parametrizada
        query = """
            SELECT
              movieId,
              predicted_rating
            FROM
              ML.RECOMMEND(
                MODEL `midyear-calling-460715-b8.ratings_eu.mf_model_ratings2000_eval`,
                (SELECT @uid AS userId)
              )
            ORDER BY
              predicted_rating DESC
            LIMIT 30
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("uid", "INT64", user_id_int)
            ]
        )
        query_job = client.query(query, job_config=job_config)
        results = query_job.result()

        movie_ids = [row.movieId for row in results]
        if not movie_ids:
            return make_response(
                jsonify({"error": "No se encontraron recomendaciones para este userId"}), 404,
                {'Access-Control-Allow-Origin': '*'}
            )

        movie_details = fetch_movie_details(movie_ids)
        return make_response(jsonify(movie_details), 200, {
            'Access-Control-Allow-Origin': '*'
        })

    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500, {
            'Access-Control-Allow-Origin': '*'
        })
