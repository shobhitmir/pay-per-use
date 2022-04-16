import React, { useRef } from 'react'
import Row from '../Row';
import requests, { API_KEY } from '../requests';
import Banner from '../Banner';
import Nav from '../Nav';
import './HomeScreen.css'
import axios from 'axios';
import { useState } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import { useNavigate } from 'react-router-dom';

const base_url = "https://image.tmdb.org/t/p/original/";

function HomeScreen() {
  const [query, setQuery] = useState("")
  const [results,setResults] = useState([])
  const searchRef = useRef(null)
  const navigate = useNavigate()

  async function fetchData(fetchUrl)
    {
        const request = await axios.get(fetchUrl);
        setResults(request.data.results)
    }

    const searchMovie = (e) => {
      e.preventDefault()
      setQuery(searchRef.current.value)
      const fetchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`
      fetchData(fetchUrl)
    }

    function truncate(str, n)
    {
        return str?.length > n ? str.substr(0,n-1) + "..." : str;
    }

    const getInfo = (e) => 
    {
      e.preventDefault()
      if (e.target.name)
      {
        navigate(`/info/tv/${e.target.value}`)
      }
      else
      {
        navigate(`/info/movie/${e.target.value}`)
      }
  }

    return (
      <div className="homeScreen">
        <Nav />
        <div className='searchbar'>
        <input ref={searchRef} className='search__input' placeholder="Search for a movie"
        onChange={searchMovie}/>
        <i onClick={searchMovie} className="fa fa-search search__icon"></i>
        </div>
      <div>
      {(query && results.length>0) ? 
      (
        <div>
                {results.map(result=> (
                  <>
                  <header className="movie"
                  style={{
                      backgroundSize: "contain",
                      backgroundImage: `url(
                          "https://image.tmdb.org/t/p/original/${result?.backdrop_path}"
                      )`,
                      backgroundPosition: "center center",
                  }}>
              
                  <div className="movie__contents">
                      <h1 className="movie__title">
                          {result?.title || result?.name || result?.original_name}
                      </h1>
              
                      <div className="movie__buttons">
                          <button className="banner__button">Purchase</button>
                          <button className="banner__button" name={result?.first_air_date} value={result?.id} onClick={getInfo}>Info</button>
                      </div>
              
                      <h1 className="movie__description">
                      {truncate(result?.overview, 150)}
                      </h1>
                  </div>
                  </header>
                  <h1 className='movie__sep'></h1>
                  </>
                ))}
        </div>
      ) :
      (
        <>
        <Banner />
        <br></br>
        <Row title="NETFLIX ORIGINALS" fetchUrl={requests.fetchNetflixOriginals} isLargeRow/>
        <Row title="Trending Now" fetchUrl={requests.fetchTrending} />
        <Row title="Top Rated" fetchUrl={requests.fetchTopRated} />
        <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} />
        <Row title="Comedy Movies" fetchUrl={requests.fetchComedyMovies} />
        <Row title="Horror Movies" fetchUrl={requests.fetchHorrorMovies} />
        <Row title="Romance Movies" fetchUrl={requests.fetchRomanceMovies} />
        <Row title="Documentaries" fetchUrl={requests.fetchDocumantaries} />
        </>
      )
      }
      </div>
      </div>
    );
  }
  
  export default HomeScreen;