// MoviePage.tsx
import React from 'react';
import type { Movie } from '../objects';

type MoviePageProps = {
  movie: Movie;
};

const MoviePage: React.FC<MoviePageProps> = ({ movie }) => {
  return (
    <div className="h-[90%] w-2/3 bg-white rounded-3xl z-20" style={{ border: '1px solid black' }}>
      <div className="p-4">
        <h2 className="text-xl font-bold text-center">{movie.title}</h2>
        <p className="text-sm text-gray-600 text-center">{movie.original_title}</p>
        <div className='flex'>
          <div className='w-1/2 h-96'>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="mx-auto mt-4 h-96 w-auto object-contain"

            />
          </div>
          <div className='w-1/2 h-96'>
            <div className='h-1/2 w-full'>
              <p className="mt-2 font-bold text-center">Release Date:</p>
              <p className='text-center'>{movie.release_date.split('',16)}</p>
              <p className="mt-2 font-bold text-center">Overview:</p>
              <p className="line-clamp-4">
                {movie.overview}
              </p>
            </div>
            <div className='h-1/2 w-full'>
                <p className='flex gap-6 items-center'><div className='font-bold text-3xl'>{movie.vote_average}</div><div className='text-xl text-gray-500'>{movie.vote_count} votes</div></p>
            </div>
          </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default MoviePage;
