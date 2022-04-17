import React, { useEffect, useState } from 'react'
import { Button, Container, Modal, Row } from 'react-bootstrap';
import './MovieScreen.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_KEY } from '../requests';
import Nav from '../Nav';
import ReactPlayer from 'react-player';



function MovieScreen(props) {
    const [movie,setMovie] = useState(null)
    const [viewSeasons, setViewSeasons] = useState(false)
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const [trailerUrl, setTrailerUrl] = useState('')

    async function fetchData(fetchUrl)
    {
        const result = await axios.get(fetchUrl)
        setMovie(result.data)
    }

    function truncate(str, n)
    {
        return str?.length > n ? str.substr(0,n-1) + "..." : str;
    }

    const movie_id = parseInt(useParams().id,10)
    const type = useParams().type
    const fetchmovieUrl = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${API_KEY}&append_to_response=videos`
    const fetchtvUrl = `https://api.themoviedb.org/3/tv/${movie_id}?api_key=${API_KEY}&append_to_response=videos`
    const domain = (type=='tv') ? 'TV Series' : 'Movie'

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

    const showTrailer = (e) => {
        e.preventDefault()
        const videos = movie?.videos?.results?.filter(
            (video)=> {return (video?.type==="Trailer" || video?.type==="trailer")})
        const trailer = videos?.filter((video) => {return video?.name==="Official Trailer"})
        setTrailerUrl(`https://www.youtube.com/watch?v=${trailer[0]?.key}`)
        setShow(true)
    }

  return (
    <div className='moviescreen'>
    <Nav/>
    {viewSeasons ? 
    (
    <div>
        <div className="season__buttons">
                    <button className="season__button season__back" 
                    onClick={(e)=>{console.log('hi');e.preventDefault();setViewSeasons(!viewSeasons)}}>Back</button>
        </div>
            {movie?.seasons.map(season=> (
            <>
            <header className="season"
            style={{
                backgroundSize: "contain",
                backgroundImage: `url(
                    "https://image.tmdb.org/t/p/original/${season?.poster_path}"
                )`,
                backgroundPosition: "center center",
            }}>
        
            <div className="season__contents">
                <h1 className="season__title">
                    {season?.title || season?.name || season?.original_name}
                </h1>
        
                <div className="season__buttons">
                    <button className="season__button">Purchase</button>
                    <button className="season__button season__episodes" disabled>Episodes : {season?.episode_count}</button>
                </div>
        
                <h1 className="season__description">
                {truncate(season?.overview, 150)}
                </h1>
            </div>
            </header>
            <h1 className='season__sep'></h1>
            </>
            ))}
    </div>
    ) :
    (
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

            <h5 className="movie__genres">
            {movie?.genres.map(genre => <div className='movie__genre'>{genre?.name}</div>)}
            </h5>
    
            <h1 className="movie__description">
            {truncate(movie?.overview,200)}
            <div className="movie__buttons">
                <button className="movie__button">Purchase</button>
                <button className="movie__button" onClick={showTrailer}>Trailer</button>
                {movie?.seasons && <button className="movie__button" 
                onClick={(e)=>{e.preventDefault();setViewSeasons(!viewSeasons)}}>View Seasons</button>}
            </div>
            </h1>

            <Modal contentClassName='trailer__modal' show={show} onHide={handleClose}>
            <Modal.Body>
            {trailerUrl && <ReactPlayer url={trailerUrl} controls={true} />}
            </Modal.Body>
            </Modal>




            <div className='movie__metadata'>
            <h1 className="movie__metadataheading">
                Info
            </h1>
            <h5 className="movie__details">
            <div className='movie__detail rating'>Rating : {movie?.vote_average}</div>
            <div className='movie__detail stars'>Stars :<span> </span> 
            {
              [...Array(Math.round(movie?.vote_average || 0))].map((elementInArray,rating) =>
              ( 
                  (((rating+1)%2==0 && <span className="fa fa-star checked c-yellow"></span>) ||
                  (((rating+1)%2!=0 && (Math.round(movie?.vote_average) - rating == 1) && <span className="fa fa-star-half-o c-yellow"></span>)))
              )
              )
          }
          </div>
          </h5>


            <h5 className="movie__details">
            <div className='movie__detail'>Type : {domain}</div>
            {movie?.runtime && <div className='movie__detail'>Duration : {movie?.runtime} Min</div>}
            {movie?.number_of_seasons && <div className='movie__detail'>Seasons :  {movie?.number_of_seasons} </div>}
            </h5>
            </div>
          </div>
    </header>
    )
    }
    </div>
  )
}

export default MovieScreen