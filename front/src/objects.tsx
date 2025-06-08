export interface Movie {
  adult: number;
  budget: number;
  id_movie: number;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: string; // O number, si siempre lo parseas a número
  poster_path: string;
  release_date: string; // Puedes usar Date si lo parseas
  revenue: string; // O number, si siempre lo parseas a número
  runtime: string; // O number, si siempre lo parseas a número
  status: string;
  tagline: string;
  title: string;
  vote_average: string; // O number
  vote_count: number;
}