import style from './style.module.scss'

export function Header(){
  const currentDate = new Date().toLocaleString()

  return(
    <header className={style.headerContainer}>
      <img src='/logo.svg' alt='logo'/>

      <p>O melhor para você ouvir, sempre</p>

      <span>{currentDate}</span>
    </header>
  );
}