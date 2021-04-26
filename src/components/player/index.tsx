import style from './style.module.scss'
import { useRef, useEffect, useState } from 'react'
import { usePlayer } from '../../contexts/PlayerContext';
import Image from 'next/image'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { convertDurationToTime } from '../../utils/convertDurationToTime';


export function Player(){

  const audioRef = useRef<HTMLAudioElement>(null);
  const[progress, setProgress]  = useState(0)

  const {
    episodeList, 
    currentEpisodeIndex, 
    isPlaying, 
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    clearPlayerState,
  } = usePlayer()

  useEffect(()=> {
    if(!audioRef.current){
      return;
    }
    if(isPlaying){
      audioRef.current.play()
    }else{
      audioRef.current.pause()
    }
  },[isPlaying])

  function setupProgressListener(){
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () =>{
      setProgress(Math.floor(audioRef.current.currentTime))
    })
  }

  function handleSeek(amount :  number){
    audioRef.current.currentTime = amount;
    setProgress(amount);

  }

  function handleEpisodeEnded(){
    if(hasNext){
      playNext()
    }else {
      clearPlayerState()
    }
  }
  const episode =  episodeList[currentEpisodeIndex]

  return(
    <div className={style.playerContainer}>
      <header>
        <img src="/playing.svg" alt="playing"/>
        <strong>Tocando agora</strong>
      </header>

      { episode? (
        <div className={style.currentEpisode}>
          <Image width = {592} height = {592} src={episode.thumbnail} objectFit='cover'/>
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
        
      ) : (
        <div className={style.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      
      
      <footer className={!episode ? style.empty : ""}>

        <div className={style.progress}>
        <span>{convertDurationToTime(progress)}</span>
          <div className={style.slider}>
            {episode ? <Slider max={episode.duration} onChange={handleSeek} value={progress} trackStyle={{backgroundColor:'#04d361' }}railStyle={{backgroundColor:'#9f75ff'}} handleStyle={{borderColor:'#04d361', borderWidth:4}} /> : <div className={style.emptySlider}/>}
          </div>
          <span>{convertDurationToTime(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio src={episode.url} autoPlay ref={audioRef} onEnd={handleEpisodeEnded} loop={isLooping} onLoadedMetadata={setupProgressListener} />
        )}

        <div className={style.buttons}>
          <button type="button"  disabled={!episode || episodeList.length == 1}  onClick={toggleShuffle}  className={isShuffling ? style.isActive: ''} >
            <img src="/shuffle.svg" alt="shuffle"/>
          </button>

          <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious} >
            <img src="/play-previous.svg" alt="play-previous"/>
          </button>

          <button type="button" disabled={!episode} className={style.playButton} onClick={togglePlay} >
            {isPlaying ?<img src="/pause.svg" alt="play" /> : <img src="/play.svg" alt="play" /> }
            
          </button>

          <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
            <img src="/play-next.svg" alt="play-next"/>
          </button>

          <button type="button" disabled={!episode}  onClick={toggleLoop}  className={isLooping ? style.isActive: ''}> 
            <img src="/repeat.svg" alt="repeat"/>
          </button>

        </div>

      </footer>

    </div>
  );
}