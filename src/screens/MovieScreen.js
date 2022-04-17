import React, { useEffect, useState } from 'react'
import './MovieScreen.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_KEY } from '../requests';
import Nav from '../Nav';


function MovieScreen(props) {
    const [movie,setMovie] = useState(null)

    function truncate(str, n)
    {
        return str?.length > n ? str.substr(0,n-1) + "..." : str;
    }

    async function fetchData(fetchUrl)
    {
        const result = await axios.get(fetchUrl)
        setMovie(result.data)
    }

    const movie_id = parseInt(useParams().id,10)
    const type = useParams().type
    const fetchmovieUrl = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${API_KEY}`
    const fetchtvUrl = `https://api.themoviedb.org/3/tv/${movie_id}?api_key=${API_KEY}`

    useEffect(() => {
        if (type === 'tv')
        {
            fetchData(fetchtvUrl)
        }
        else
        {
            fetchData(fetchmovieUrl)
        }
    }, [])

  return (
    <div className='moviescreen'>
    <Nav/>
    <header className="moviebanner"
                  style={{
                      backgroundSize: "contain",
                      backgroundImage: `url(
                          "https://image.tmdb.org/t/p/original/${movie?.backdrop_path}"
                      )`,
                      backgroundPosition: "center center",
                  }}>
              
                  <div className="movie__contents">
                      <h1 className="movie__title">
                          {movie?.title || movie?.name || movie?.original_name}
                      </h1>
              
                      <div className="movie__buttons">
                          <button className="movie__button">Purchase</button>
                          <button className="movie__button">Info</button>
                      </div>
              
                      <h1 className="movie__description">
                      {truncate(movie?.overview, 150)}
                      </h1>
                    </div>
                  </header>
    </div>
  )
}

export default MovieScreen