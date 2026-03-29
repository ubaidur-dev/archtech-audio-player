import React, { useState, useRef, useEffect, useCallback } from 'react';
import { songsData } from './data/songs';
import './styles/App.css';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [search, setSearch] = useState("");
  
  
  const audio = useRef(new Audio(songsData[0].url));
  const intervalRef = useRef();
  const activeTrack = songsData[currentIndex];

 
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };


  useEffect(() => {
    audio.current.volume = volume;
  }, [volume]);

 
  const handleProgress = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress(audio.current.currentTime);
    }, 1000); // Updated to 1s for better performance
  }, []);


  useEffect(() => {
    const player = audio.current;
    
    const onMetadataLoad = () => setTrackDuration(player.duration);
    const onTrackEnd = () => nextTrack(); // Auto-skip logic

    player.addEventListener('loadedmetadata', onMetadataLoad);
    player.addEventListener('ended', onTrackEnd);

    if (isPlaying) {
      player.play().then(handleProgress).catch(e => console.warn("Playback error:", e));
    } else {
      player.pause();
      clearInterval(intervalRef.current);
    }

    return () => {
      player.removeEventListener('loadedmetadata', onMetadataLoad);
      player.removeEventListener('ended', onTrackEnd);
      clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentIndex, handleProgress]);

  useEffect(() => {
    const player = audio.current;
    player.pause();
    player.src = songsData[currentIndex].url;
    setProgress(0);
    
    if (isPlaying) {
      player.play().catch(() => {});
    }
  }, [currentIndex]);

  const nextTrack = () => {
    setCurrentIndex((prev) => (prev + 1) % songsData.length);
  };

  const prevTrack = () => {
    setCurrentIndex((prev) => (prev - 1 + songsData.length) % songsData.length);
  };

  const filteredItems = songsData.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-viewport">
      <div className="player-card">
        
        <header className="nav-bar">
          <div className="logo-brand">ARCHTECH <span>PLAYER</span></div>
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="Find your vibe..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="app-grid">
          <section className="player-ui">
            <div className="visuals-box">
              <div className={`vinyl ${isPlaying ? 'spin' : ''}`}>
                <img src={activeTrack.cover} alt="album-art" className="cover-img" />
                <div className="pin"></div>
              </div>
              
              <div className="info-box">
                <h1>{activeTrack.title}</h1>
                <p>{activeTrack.artist}</p>
              </div>
            </div>

            <div className="bottom-panel">
              <div className="time-display">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(trackDuration)}</span>
              </div>
              <input 
                type="range" 
                value={progress}
                step="1"
                min="0"
                max={trackDuration || 0}
                className="seeker"
                onChange={(e) => (audio.current.currentTime = e.target.value)}
              />
              
              <div className="controls-stack">
                <div className="btns-unit">
                  <button className="nav-btn" onClick={prevTrack}>◀◀</button>
                  <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button className="nav-btn" onClick={nextTrack}>▶▶</button>
                </div>

                <div className="vol-unit">
                  <span className="vol-icon">{volume < 0.1 ? '🔇' : '🔊'}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={volume} 
                    className="vol-slider" 
                    onChange={(e) => setVolume(parseFloat(e.target.value))} 
                  />
                </div>
              </div>
            </div>
          </section>

          <aside className="list-ui">
            <div className="list-head">
              <h3>Playlist <span>({filteredItems.length})</span></h3>
            </div>
            <div className="scroll-area">
              {filteredItems.length > 0 ? (
                filteredItems.map((song) => {
                  const songIdx = songsData.findIndex(s => s.id === song.id);
                  const isCurrent = songIdx === currentIndex;
                  return (
                    <div 
                      key={song.id} 
                      className={`track-card ${isCurrent ? 'active' : ''}`}
                      onClick={() => { setCurrentIndex(songIdx); setIsPlaying(true); }}
                    >
                      <img src={song.cover} alt="thumb" />
                      <div className="track-txt">
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                      {isCurrent && <div className="waves"><span></span><span></span><span></span></div>}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state"><p>No songs found!</p></div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
