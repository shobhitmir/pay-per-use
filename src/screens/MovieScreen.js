import React, { useEffect, useState } from 'react'
import { Button, Container, Modal, Row } from 'react-bootstrap';
import './MovieScreen.css'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_KEY } from '../requests';
import Nav from '../Nav';
import ReactPlayer from 'react-player';



function MovieScreen(props) {
    const [movie,setMovie] = useState(null)
    const [viewState, setViewState] = useState(0)
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const [seasonNumber,setSeasonNumber] = useState('')
    const [trailerUrl, setTrailerUrl] = useState('')
    const [season,setSeason] = useState(null)
    const navigate = useNavigate()

    async function fetchData(fetchUrl)
    {
        const result = await axios.get(fetchUrl)
        setMovie(result.data)
    }

    async function fetchSeasonData(fetchUrl)
    {
        const result = await axios.get(fetchUrl)
        setSeason(result.data)
    }

    function truncate(str, n)
    {
        return str?.length > n ? str.substr(0,n-1) + "..." : str;
    }

    const movie_id = parseInt(useParams().id,10)
    const type = useParams().type
    const fetchmovieUrl = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${API_KEY}&append_to_response=videos`
    const fetchtvUrl = `https://api.themoviedb.org/3/tv/${movie_id}?api_key=${API_KEY}&append_to_response=videos`
    const fetchseasonUrl = `https://api.themoviedb.org/3/tv/${movie_id}/season/${seasonNumber}?api_key=${API_KEY}&append_to_response=videos`
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
        if (viewState ===2)
        {
            fetchSeasonData(fetchseasonUrl)
        }
    }, [viewState])

    const showTrailer = (e) => {
        e.preventDefault()
        const trailers = movie?.videos?.results?.filter(
            (video)=> {return (video?.type==="Trailer" || video?.type==="trailer")})
        const official_trailers = trailers?.filter((video) => {return video?.name==="Official Trailer" || video?.name==="official trailer" })
        const teasers = movie?.videos?.results?.filter(
            (video)=> {return (video?.type==="Teaser" || video?.type==="teaser")})
        const official_teasers = teasers?.filter((video) => {return video?.name==="Official Teaser" || video?.name==="official teaser" })
        setTrailerUrl(`https://www.youtube.com/watch?v=${official_trailers[0]?.key||trailers[0]?.key||official_teasers[0]?.key||teasers[0]?.key||movie?.videos?.results[0]?.key}`)
        setShow(true)
        console.log(movie)
    }

  return (
    <div className='moviescreen'>
    <Nav/>
    {viewState===0 &&
        <>
        <div className="episode__buttons">
        <button className="episode__button episode__back" 
        onClick={(e)=>{e.preventDefault();navigate('/')}}>Back</button>
        </div>  
        
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
                onClick={(e)=>{e.preventDefault();setViewState(1)}}>View Seasons</button>}
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
    </header></>}


    {viewState===1 && 
    <div>
        <div className="season__buttons">
                    <button className="season__button season__back" 
                    onClick={(e)=>{e.preventDefault();setViewState(0)}}>Back</button>
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
                    <button className="season__button"
                    onClick={(e)=> {e.preventDefault();setSeasonNumber(season?.season_number);setViewState(2)}}>View Episodes</button>
                </div>
        
                <h1 className="season__description">
                {truncate(season?.overview, 150)}
                </h1>
            </div>
            </header>
            <h1 className='season__sep'></h1>
            </>
            ))}
    </div>}


    {viewState===2 && 
    <div>
        <div className="episode__buttons">
                    <button className="episode__button episode__back" 
                    onClick={(e)=>{e.preventDefault();setViewState(1)}}>Back</button>
        </div>
            
        {season?.episodes?.map(episode=> (
            <>
            <header className="episode"
            style={{
                backgroundSize: "contain",
                backgroundImage: `url(
                    "https://image.tmdb.org/t/p/original/${episode?.still_path}"
                )`,
                backgroundPosition: "center center",
            }}>
        
            <div className="episode__contents">
                <h1 className="episode__title">
                    {episode?.title || episode?.name || episode?.original_name}
                </h1>
        
                <div className="episode__buttons">
                <h5 className="episode__details">
                    <button className="episode__button episode__purchase">Purchase</button>
                    <div className='episode__detail episode__rating'>Rating : {episode?.vote_average}</div>
                    <div className='episode__detail episode__stars'>Stars :<span> </span> 
                    {
                    [...Array(Math.round(episode?.vote_average || 0))].map((elementInArray,rating) =>
                    ( 
                        (((rating+1)%2==0 && <span className="fa fa-star checked c-yellow"></span>) ||
                        (((rating+1)%2!=0 && (Math.round(episode?.vote_average) - rating == 1) && <span className="fa fa-star-half-o c-yellow"></span>)))
                    )
                    )
                    }
                    </div>
                    </h5>
                </div>
        
                <h1 className="episode__description">
                {truncate(episode?.overview, 150)}
                </h1>
            </div>
            </header>
            <h1 className='episode__sep'></h1>
            </>
            ))}

    </div>}
    </div>
  )
}

export default MovieScreen