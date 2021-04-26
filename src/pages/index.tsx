import { GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import {format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import {api} from '../services/api'
import { parse } from 'node:path'
import { convertDurationToTime } from '../utils/convertDurationToTime'

import styles from './home.module.scss'
import { usePlayer } from '../contexts/PlayerContext'

type Episode ={
  id: string,
  title: string,
  thumbnail: string,
  members: string,
  publishedAt: string,
  duration: number,
  durationString : string,
  url: string,
}

type HomeProps = {
  latestEpisode: Episode[];
  allEpisodes: Episode[];
}

export default function Home({latestEpisode,allEpisodes} :  HomeProps) {

  const { playList } = usePlayer()
  const episodeList =[...latestEpisode, ...allEpisodes];


  return (
    <div className={styles.homePage}>
      <Head>
        <title>Home  |  Podcastr</title>
      </Head>

      <section className={styles.latestEpisode}>
        <h2>Últimos Lançamentos</h2>
        <ul>
            {latestEpisode.map( (episode, index) => {
              return(
                <li key ={episode.id}>
                  <Image 
                    width={192} 
                    height={192} 
                    src={episode.thumbnail}
                     alt={episode.title} 
                     objectFit="cover" 
                  />

                  <div className={styles.episodeDetails}>
                    <Link href={`/episodes/${episode.id}`}>   
                      <a>{episode.title}</a>
                    </Link>

                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationString}</span>
                  </div>

                  
                  <button type="button" onClick={()=> playList(episodeList, index)} >
                    <img src="play-green.svg" alt="play_button"/>
                  </button>
                </li>
              )
            })}
        </ul>

      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index)=>{
              return(
                <tr key={episode.id} >
                  <td style={{width:100}} >
                    <Image 
                      src={episode.thumbnail} 
                      height={120} 
                      width={120} 
                      objectFit="cover" 
                      alt={episode.title}  
                    />
                  </td>

                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a >{episode.title}</a>
                    </Link>
                  </td>

                  <td>{episode.members}</td>
                  <td style={{width:100}} >{episode.publishedAt}</td>
                  <td>{episode.durationString}</td>

                  <td>
                    <button type="button">
                      <img src="play-green.svg" alt="switch episode"  onClick={()=> playList(episodeList,index + latestEpisode.length)} />
                    </button>
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}


export const getStaticProps : GetStaticProps = async () => {
  const {data} = await api.get('episodes',{
    params: {
      _limit : 12,
      _sort : 'published_at',
      _order: 'desc',
    }
  })

  const episodes = data.map(episode =>{
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at),'d MMM yy',{locale: ptBR}),
      duration: Number(episode.file.duration),
      durationString : convertDurationToTime(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })

  const latestEpisode = episodes.slice(0,2)
  const allEpisodes = episodes.slice(2,episodes.length)

  return {
    props:{
      latestEpisode,
      allEpisodes
    },
    revalidate:60*60*8,
  }
}
