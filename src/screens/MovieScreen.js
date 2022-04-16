import React, { useEffect, useState } from 'react'
import './MovieScreen.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_KEY } from '../requests';
import Nav from '../Nav';


function MovieScreen(props) {
    const [movie,setMovie] = useState(null)
    const [tv,setTV] = useState(null)

    function truncate(str, n)
    {
        return str?.length > n ? str.substr(0,n-1) + "..." : str;
    }

    async function fetchMovieData(fetchUrl)
    {
        const result = await axios.get(fetchUrl)
        setMovie(result.data)
    }

    async function fetchTVData(fetchUrl)
    {
        const result = await axios.get(fetchUrl)
        setTV(result.data)
    }

    const movie_id = parseInt(useParams().id,10)
    const type = useParams().type
    const fetchmovieUrl = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${API_KEY}`
    const fetchtvUrl = `https://api.themoviedb.org/3/tv/${movie_id}?api_key=${API_KEY}`

    useEffect(() => {
        if (type === 'tv')
        {
            fetchMovieData(fetchtvUrl)
        }
        else
        {
            fetchMovieData(fetchmovieUrl)
        }
    }, [])

  return (
    <div className='moviescreen'>
    <Nav/>
    <header className="movie"
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
                          <button className="banner__button">Purchase</button>
                          <button className="banner__button">Info</button>
                      </div>
              
                      <h1 className="movie__description">
                      {truncate(movie?.overview, 150)}
                      </h1>
                  </div>
                  <div className="movie--fadeBottom" />
                  </header>
                </div>
  )
}

export default MovieScreen