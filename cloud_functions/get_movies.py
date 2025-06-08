import os
import pymysql
from pymysql.cursors import DictCursor
from flask import jsonify, make_response, request
import functions_framework

def get_connection():
    return pymysql.connect(
        host='35.241.209.88',
        user='root',
        password="#\\5.Go~{3Z^1*6.y",
        db='recomendacion',
        charset='utf8mb4',
        cursorclass=DictCursor
    )

def run_query(limit, offset):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = "SELECT * FROM movies LIMIT %s OFFSET %s"
            cur.execute(sql, (limit, offset))
            return cur.fetchall()
    finally:
        conn.close()

@functions_framework.http
def get_movies(request):
    if request.method == 'OPTIONS':
        return ('', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })
        
    try:
        # parse ?limit=10&offset=0 (defaults)
        limit = int(request.args.get('limit', '10'))
        offset = int(request.args.get('offset', '0'))
        movies = run_query(limit, offset)
        return make_response(jsonify(movies), 200, {
          'Access-Control-Allow-Origin': '*'
        })
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)
