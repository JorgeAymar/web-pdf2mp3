import './AudioPlayer.css';

const AudioPlayer = ({ src }) => {
  return (
    <div className="audio-player-container">
      <audio controls className="custom-audio" autoPlay>
        <source src={src} type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </div>
  );
};

export default AudioPlayer;
