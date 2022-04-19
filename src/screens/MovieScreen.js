import React, { useEffect, useState } from 'react'
import { Button, Container, Modal, Row } from 'react-bootstrap';
import './MovieScreen.css'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_KEY } from '../requests';
import Nav from '../Nav';
import ReactPlayer from 'react-player';
import { MovieContractABI, MovieContractAddress} from '../abi';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { database } from '../firebase';


const Web3 = require("web3");
const web3 = new Web3(window.ethereum);
const MovieContract = new web3.eth.Contract(MovieContractABI,MovieContractAddress)


function MovieScreen() {
    const [movie,setMovie] = useState(null)
    const [viewState, setViewState] = useState(0)
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const [seasonNumber,setSeasonNumber] = useState('')
    const [trailerUrl, setTrailerUrl] = useState('')
    const [season,setSeason] = useState(null)
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const [currentSubscriptions, setSubscriptions] = useState(null)


    function initSubscriptions()
    {
        var seasons = {}
        movie?.seasons?.map((season) => 
        {
        seasons[season?.season_number] = {}
        for(var epi=1;epi<=season?.episode_count;epi++)
        {
            seasons[season?.season_number][epi] = [false,0]
        }
        })
        if (Object.keys(seasons).length === 0) 
        {
            return [false,0]
        }
        else
        {
            return seasons
        }

    }

    function updateSubscriptions(subscriptions,purchased)
    {
        if (purchased['episode'])
        {
            subscriptions[purchased['season']][purchased['episode']] = [true,0]
        }
        else if (purchased['season'] || purchased['season'] === 0)
        {
            for (var episode in subscriptions[purchased['season']])
            {
                subscriptions[purchased['season']][episode] = [true,0]
            }
        }
        else 
        {
            if (type === 'tv')
            {
                for (var season in subscriptions)
                {
                    for (var episode in subscriptions[season])
                    {
                        subscriptions[season][episode] = [true,0]
                    }
                }
            }
            else
            {
                subscriptions = [true,0];
            }
        }
        return subscriptions
    }

    const purchaseMovie = (e) => {
        e.preventDefault();
        var purchased;
        if (e.target.name)
        {
            purchased =  JSON.parse(e.target.name)
        }
        else
        {
            purchased = {}
        }
        const price = e.target.value
        if (!JSON.parse(localStorage.getItem('user'))?.public_key && !user?.public_key)
        {
          alert('Please link your ethereum account to proceed..')
          navigate('/profile')
        }
        else
        {
          MovieContract.methods.buy_movie(user?.email,movie?.id,type,price)
          .send({ from: (JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key) })
          .then(() => 
          {
              var subscriptions;
              if (!currentSubscriptions)
              {
                subscriptions = initSubscriptions(purchased)
                subscriptions = updateSubscriptions(subscriptions,purchased)
              }
              else
              {
                  subscriptions = updateSubscriptions(currentSubscriptions,purchased)
              }
                const key = movie_id+":"+type
                database.ref("user_subscriptions/" + user?.uid).update({
                    [key]: subscriptions
                }).then(()=>{window.alert('Purchase Successful !!');
                window.location.reload(false)
                })
                .catch(alert)
          })
          .catch((err)=>{window.alert('Error : ' + err.message)})
        }
    }

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

    function fetchSubscriptions()
    {
        const key = movie_id + ':' + type
        database.ref("user_subscriptions/" + user?.uid + '/' + key)
        .once("value",(snapshot) => 
        {
            setSubscriptions(snapshot.val())
        })
    }

    useEffect(() => {
        if (type === 'tv')
        {
            fetchData(fetchtvUrl)
            fetchSeasonData(fetchseasonUrl)
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

    fetchSubscriptions()

    const hasPurchasedEP = function(season,episode)
    {
        if (currentSubscriptions)
        {
            return currentSubscriptions[season][episode][0];
        }
        return false;
    }

    const hasPurchasedSeason = function(season)
    {
        if (currentSubscriptions)
        {
            for (var episode in currentSubscriptions[season])
            {
                if (!currentSubscriptions[season][episode][0])
                {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    const hasPurchasedMovie = function()
    {
        if (currentSubscriptions)
        {
            for (var season in currentSubscriptions)
            {
                for (var episode in currentSubscriptions[season])
                {
                    if (!currentSubscriptions[season][episode][0])
                    {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    const showTrailer = (e) => {
        e.preventDefault()
        const default_url = "IKhxRdN2UkQ"
        const trailers = movie?.videos?.results?.filter(
            (video)=> {return (video?.type==="Trailer" || video?.type==="trailer")})
        const official_trailers = trailers?.filter((video) => {return video?.name==="Official Trailer" || video?.name==="official trailer" })
        const teasers = movie?.videos?.results?.filter(
            (video)=> {return (video?.type==="Teaser" || video?.type==="teaser")})
        const official_teasers = teasers?.filter((video) => {return video?.name==="Official Teaser" || video?.name==="official teaser" })
        setTrailerUrl(`https://www.youtube.com/watch?v=${official_trailers[0]?.key||trailers[0]?.key||official_teasers[0]?.key||teasers[0]?.key||movie?.videos?.results[0]?.key||default_url}`)
        setShow(true)
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
                {!hasPurchasedMovie() ? 
                (<button className="movie__button" value={movie?.number_of_episodes || 3} 
                onClick={purchaseMovie}>Purchase : {movie?.number_of_episodes || 3} PPU</button>) :
                (<button className="movie__button">Play</button>)}
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
                {!hasPurchasedSeason(season?.season_number) ?
                (
                    <button className="season__button" name={'{"season":'+season?.season_number+"}"} value={season?.episode_count}
                    onClick={purchaseMovie}>Purchase : {season?.episode_count} PPU</button>)
                :
                (<button className="season__button">Play</button>)}
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
                    {!hasPurchasedEP(season?.season_number,episode?.episode_number) ?
                    (<button className="episode__button episode__purchase" 
                    name={'{"season":'+season?.season_number+',"episode":'+episode?.episode_number+"}"} value={1}
                    onClick={purchaseMovie}>Purchase : 1 PPU</button>) :
                    (<button className="episode__button episode__purchase">Play</button>)
                    }
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