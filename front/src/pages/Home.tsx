import React, {useState, useEffect, useRef} from 'react';
import { getMovies } from '../api';
import type { Movie } from '../objects';
import { useMyContext } from '../context/MyContext';

import MoviePage from './MoviePage';
import MyRecomendation from './MiRecomendations';
import MyHistory from './MyHistory';

const LIMIT = 20;


const Home: React.FC = () => {
  const { username, logged, setUsername, setLogged } = useMyContext();

  const [showPopup, setShowPopUp]   = useState(false);
  const [movies, setMovies]   = useState<Movie[]>([]);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedPage, setSelectedPage] = useState('Home');
  // fetch whenever offset changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMovies({ limit: LIMIT, offset })
      .then(page => {
        if (!cancelled) {
          setMovies(prev => [...prev, ...page]);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [offset]);

  // intersection observer to bump offset
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          setOffset(prev => prev + LIMIT);
        }
      },
      { root: null, rootMargin: '0px', threshold: 1.0 }
    );
    observer.observe(sentinelRef.current);
    return () => { observer.disconnect(); };
  }, [loading]);


  return (
    <div className="h-screen w-screen flex">
      <div className='font-mono py-20 w-[8%] h-full bg-black justify-center items-center flex flex-col gap-20'>
        <img src="/movie_library_white.png" alt="" className="object-contain h-10 cursor-pointer" onClick={()=>{setSelectedPage('Home')}}/>
        <p className='text-center font-bold text-white text-md cursor-pointer' onClick={()=>{setSelectedPage('Home')}}>
            MOVIE <br />TRACKER
        </p>
        <p>
          {logged && username && (
            <div>
              <p className="text-white text-center">{username}</p>
              <p className="text-white text-center font-bold mt-12 text-sm cursor-pointer" onClick={()=>{setSelectedPage('Recomendacion')}}> Mis Recomendaciones</p>
              <p className="text-white text-center font-bold mt-12 text-sm cursor-pointer" onClick={()=>{setSelectedPage('Historial')}}> Historial</p>
            </div>
          )}
        </p>
        <div className='h-full'></div>
        {logged ?
          (<div className='bg-white p-2 text-black cursor-pointer' onClick={()=>{setLogged(false); setUsername(null)}}>
            CERRAR SESION
          </div>) : (
            <div className='bg-white p-2 text-black cursor-pointer' onClick={()=>setShowPopUp(true)}>
            INICIAR SESION
          </div>
          )
        }
                    
        </div>
        <div className="w-[92%] h-full overflow-auto p-4">
          { selectedPage === 'Home' ? 
          (
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
            <div ref={sentinelRef} style={{ height: 1 }} />
            </div>
          ) : selectedPage === 'Recomendacion' ? (
            <MyRecomendation/>
          ) : selectedPage === 'Historial' ?(
            <MyHistory/>
          ): (<div>NADA</div>)}
          
        </div>
      
      {selectedMovie && (
          <div 
            className='absolute h-screen w-screen bg-gray-300/60 flex justify-center items-center'
            style={{
              zIndex:999
            }} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedMovie(null);
            }}
            >
            <MoviePage movie={selectedMovie} />
          </div>
        )}
      {showPopup &&
        <div className='absolute z-40 bg-gray-300/50 w-screen h-screen flex justify-center items-center' onClick={(e)=>{e.preventDefault(); e.stopPropagation(); setShowPopUp(false); setUsername(null)}}>
          <div className='z-50 w-1/3 h-1/3 rounded-2xl bg-white flex flex-col items-center justify-center gap-3' onClick={(e)=>{e.stopPropagation()}}>
            <label className='font-bold text-3xl'>USUARIO</label>
            <input className='border-2 border-gray-200 px-2 py-1' type="text" placeholder='num_usuario' value={username? username : ''} onChange={(e)=>{e.preventDefault(); e.stopPropagation(); setUsername(e.target.value)}}/>
            <button className='bg-black px-4 py-2 rounded-2xl text-white cursor-pointer hover:bg-gray-200 hover:text-black' onClick={()=>{setShowPopUp(false); setLogged(true)}}>ACEPTAR</button>
          </div>
        </div>}

    </div>
  );
};

export default Home;
