import React, {useEffect, useState} from 'react';
import ReactPlayer from 'react-player';
import axios from "./axios";
import "./Row.css";
import { useNavigate } from 'react-router-dom';

const base_url = "https://image.tmdb.org/t/p/original/";

function Row({ title, fetchUrl, isLargeRow }) {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {

    async function fetchData()
    {
        const request = await axios.get(fetchUrl);
        setMovies(request.data.results)
        return request;
    }

    fetchData();

  }, [fetchUrl]);

  
  const handleClick = (movie) => {
    if (movie?.first_air_date)
    {
      navigate(`/info/tv/${movie.id}`)
    }
    else
    {
      navigate(`/info/movie/${movie.id}`)
    }
  }

  return (
    <div className="row">
    <h2 className='row__title'>{title}</h2>
    
        <div className="row__posters">
            {movies.map(movie => (
                <img 
                key={movie.id}
                onClick={() => handleClick(movie)}
                className={`row__poster ${isLargeRow && "row__posterLarge"}`}
                src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`} 
                alt={movie.name}/>
            ))}
        </div>
    </div>
  )
}

export default Row;