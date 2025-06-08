import os
from datetime import datetime
from flask import jsonify, make_response, request
import functions_framework
from google.cloud import bigquery
import pymysql
from pymysql.cursors import DictCursor


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
    conn = get_mysql_connection()
    try:
        with conn.cursor() as cur:
            placeholders = ",".join(["%s"] * len(movie_ids))
            sql = f"SELECT * FROM movies WHERE id_movie IN ({placeholders})"
            cur.execute(sql, movie_ids)
            return cur.fetchall()
    finally:
        conn.close()


client = bigquery.Client()


@functions_framework.http
def get_user_history(request):
    # CORS pre-flight
    if request.method == 'OPTIONS':
        return ('', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })

    try:
        uid_raw = request.args.get('userId')
        if uid_raw is None:
            return make_response(jsonify({"error": "Falta 'userId'"}), 400,
                                 {'Access-Control-Allow-Origin': '*'})
        try:
            uid = int(uid_raw)
        except ValueError:
            return make_response(jsonify({"error": "'userId' debe ser entero"}), 400,
                                 {'Access-Control-Allow-Origin': '*'})
        limit  = int(request.args.get('limit',  '20'))
        offset = int(request.args.get('offset', '0'))

        # 1. Ratings del usuario en BigQuery
        qry = """
        SELECT movieId, rating, timestamp
        FROM  `midyear-calling-460715-b8.ratings.ratings`
        WHERE userId = @uid
        ORDER BY timestamp DESC
        LIMIT  @lim
        OFFSET @off
        """
        job_cfg = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("uid", "INT64", uid),
                bigquery.ScalarQueryParameter("lim", "INT64", limit),
                bigquery.ScalarQueryParameter("off", "INT64", offset)
            ]
        )
        rows = list(client.query(qry, job_cfg))

        if not rows:
            return make_response(jsonify([]), 200,
                                 {'Access-Control-Allow-Origin': '*'})
        movie_ids = [r.movieId for r in rows]

        # 2. Detalles en MySQL
        movies = fetch_movie_details(movie_ids)
        by_id = {m["id_movie"]: m for m in movies}

        # 3. Ensamblar salida {movie:{…}, rating:…, timestamp:…}
        out = []
        for r in rows:
            out.append({
                "movie": by_id.get(r.movieId, {}),
                "rating": r.rating,
                "timestamp": datetime.utcfromtimestamp(r.timestamp).strftime("%d/%m/%Y")
            })

        return make_response(jsonify(out), 200,
                             {'Access-Control-Allow-Origin': '*'})
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500,
                             {'Access-Control-Allow-Origin': '*'})
