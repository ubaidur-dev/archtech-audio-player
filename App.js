import React, { useState, useRef, useEffect } from 'react';
import { songsData } from './data/songs';
import './styles/App.css';

function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [searchTerm, setSearchTerm] = useState("");
  
  const audioRef = useRef(new Audio(songsData[0].url));
  const timerRef = useRef();
  const currentTrack = songsData[currentTrackIndex];

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTrackProgress(audioRef.current.currentTime);
    }, 100); 
  };

  useEffect(() => {
    const audio = audioRef.current;
    const setAudioData = () => setDuration(audio.duration);
    audio.addEventListener('loadedmetadata', setAudioData);

    if (isPlaying) {
      audio.play().then(() => startTimer()).catch(() => {});
    } else {
      audio.pause();
      clearInterval(timerRef.current);
    }

    return () => audio.removeEventListener('loadedmetadata', setAudioData);
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.pause();
    audio.src = songsData[currentTrackIndex].url;
    audio.load();
    setTrackProgress(0);
    if (isPlaying) {
      audio.play().then(() => startTimer()).catch(() => {});
    }
  }, [currentTrackIndex]);

  const filteredList = songsData.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-viewport">
      <div className="player-card">
        
        <header className="nav-bar">
          <div className="logo-brand">ARCHTECH <span>PLAYER</span></div>
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="Search music..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="app-grid">
          <section className="player-ui">
            <div className="visuals-box">
              <div className={`vinyl ${isPlaying ? 'spin' : ''}`}>
                <img src={currentTrack.cover} alt="art" className="cover-img" />
                <div className="pin"></div>
              </div>
              
              <div className="info-box">
                <h1>{currentTrack.title}</h1>
                <p>{currentTrack.artist}</p>
              </div>
            </div>

            <div className="bottom-panel">
              <div className="time-display">
                <span>{formatTime(trackProgress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input 
                type="range" 
                value={trackProgress}
                step="0.1"
                min="0"
                max={duration || 0}
                className="seeker"
                onChange={(e) => (audioRef.current.currentTime = e.target.value)}
              />
              
              <div className="controls-stack">
                <div className="btns-unit">
                  <button className="nav-btn" onClick={() => setCurrentTrackIndex((i) => (i - 1 + songsData.length) % songsData.length)}>◀◀</button>
                  <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button className="nav-btn" onClick={() => setCurrentTrackIndex((i) => (i + 1) % songsData.length)}>▶▶</button>
                </div>

                <div className="vol-unit">
                  <span className="vol-icon">{volume === "0" ? '🔇' : '🔊'}</span>
                  <input type="range" min="0" max="1" step="0.01" value={volume} className="vol-slider" onChange={(e) => setVolume(e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          <aside className="list-ui">
            <div className="list-head">
              <h3>Playlist <span>({filteredList.length})</span></h3>
            </div>
            <div className="scroll-area">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const idx = songsData.findIndex(s => s.id === item.id);
                  const active = idx === currentTrackIndex;
                  return (
                    <div 
                      key={item.id} 
                      className={`track-card ${active ? 'active' : ''}`}
                      onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                    >
                      <img src={item.cover} alt="thumb" />
                      <div className="track-txt">
                        <h4>{item.title}</h4>
                        <p>{item.artist}</p>
                      </div>
                      {active && <div className="waves"><span></span><span></span><span></span></div>}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state"><p>No Vibe Found!</p></div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;