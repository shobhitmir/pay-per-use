import React, {useEffect, useState} from 'react'
import axios from './axios';
import requests from './requests';
import "./Banner.css";
import { useNavigate } from 'react-router-dom';

function Banner() {

  const [movie, setMovie] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {

    async function fetchData()
    {
        const request = await axios.get(requests.fetchNetflixOriginals);
        setMovie(request.data.results[
            Math.floor(Math.random() * request.data.results.length - 1)])
        return request
    }

    fetchData();

  }, []);

  function truncate(str, n)
  {
      return str?.length > n ? str.substr(0,n-1) + "..." : str;
  }

  const getInfo = (e) => {
      e.preventDefault()
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
    <header className="banner"
    style={{
        backgroundSize: "contain",
        backgroundImage: `url(
            "https://image.tmdb.org/t/p/original/${movie?.backdrop_path}"
        )`,
        backgroundPosition: "center center",
    }}>

    <div className="banner__contents">
        <h1 className="banner__title">
            {movie?.title || movie?.name || movie?.original_name}
        </h1>

        <div className="banner__buttons">
            <button className="banner__button" onClick={getInfo}>View Details</button>
        </div>

        <h1 className="banner__description">
        {truncate(movie?.overview, 150)}
        </h1>
    </div>

    <div className="banner--fadeBottom" />
    </header>
  )
}

export default Banner