// MoviePage.tsx
import React, { useEffect, useState } from "react";
import type { Movie } from "../objects";
import { useMyContext } from "../context/MyContext";
import MoviePage from "./MoviePage";
import { getRecomendations } from "../api";

interface Recommendations {
  movie: Movie[];
}

const MyRecomendation: React.FC = () => {
  const { username: userId, logged } = useMyContext();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  useEffect(() => {
    if (!logged || !userId) return;
    const userIdint = Number(userId); // convierte string a number

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const recs = await getRecomendations({ userId:userIdint });
        setMovies(recs);
      } catch {
        setError("Error fetching recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logged, userId]);

  if (!logged) {
    return <p className="text-white">Debes iniciar sesión para ver recomendaciones</p>;
  }

  if (loading) {
    return <div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 shadow rounded-xl p-2 h-96 w-2/3 mx-auto my-5 hover:bg-gray-300 cursor-pointer"
            style={{ border: '1px solid black' }}
          >
          </div>
        ))}
      </div>      
    </div>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
        {movies.map(movie => (
          <div
            key={movie.id_movie}
            className="bg-gray-100 shadow rounded-xl p-2 h-96 w-2/3 mx-auto my-5 hover:bg-gray-300 cursor-pointer"
            style={{ border: '1px solid black' }}
            onClick={() => {setSelectedMovie(movie); console.log('SE HA PULSADO: ', movie.title)}}
          >
            <div className="h-[80%] w-full p-4">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="h-full w-full bg-gray-200 object-contain"
              />
            </div>
            <div className="h-[20%] w-full text-center">
              {movie.original_title}
            </div>
          </div>
        ))}
        {loading && <p className="text-center">Loading...</p>}
        {selectedMovie && (
            <div 
            className='absolute z-10 h-screen w-screen bg-gray-300/60 flex justify-center items-center' 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedMovie(null);
            }}
            >
            <MoviePage movie={selectedMovie} />
            </div>
        )}
          </div>
  );
};

export default MyRecomendation;
