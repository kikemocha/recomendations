// api.ts
import axios from 'axios'
import type { Movie } from './objects'

export interface GetMoviesParams {
  limit?: number
  offset?: number
}
export interface GetRecomendationsParams {
  userId?: number
}

export interface GetUserHistoryParams {
  userId: number
  limit?: number
  offset?: number
}

export interface RatedMovie {
  movie: Movie
  rating: number
  timestamp: string
}


export async function getMovies({
  limit = 10,
  offset = 0,
}: GetMoviesParams = {}): Promise<Movie[]> {
  const response = await axios.get<Movie[]>(
    'https://getmovies-423069658414.europe-west1.run.app',
    { params: { limit, offset } }
  )
  return response.data
}

export async function getRecomendations({
  userId,
}: GetRecomendationsParams = {}): Promise<Movie[]> {
  const response = await axios.get<Movie[]>(
    'https://getrecomendations-423069658414.europe-west1.run.app',
    { params: { userId } }
  )
  return response.data
}

export async function getUserHistory(
  { userId, limit = 20, offset = 0 }: GetUserHistoryParams
): Promise<RatedMovie[]> {
  const { data } = await axios.get<RatedMovie[]>(
    'https://gethistory-423069658414.europe-west1.run.app',
    { params: { userId, limit, offset } }
  )
  return data
}