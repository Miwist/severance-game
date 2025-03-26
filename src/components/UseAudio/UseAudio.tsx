import { Howl, Howler } from 'howler';
import { useEffect, useState, useRef } from 'react';

export const useAudio = () => {
  const [isSoundOn, setIsSoundOn] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const isInitialized = useRef(false);

  // Инициализация звука
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    Howler.autoUnlock = true;
    Howler.usingWebAudio = true;

    soundRef.current = new Howl({
      src: [
        `/music/main-full.mp3`,
        `/music/done.mp3`,
        `/music/love.mp3`,
        `/music/still.mp3`
      ],
      html5: true, // Используем Web Audio API вместо HTML5 Audio
      volume: 0.7,
      loop: true,
      pool: 3, // Количество аудиоэлементов в пуле
      onplayerror: function() {
        // Разблокировка при ошибке воспроизведения
        soundRef.current?.once('unlock', () => {
          if (isSoundOn) soundRef.current?.play();
        });
      }
    });

    return () => {
      soundRef.current?.unload();
      };
  }, []);

  // Управление воспроизведением
  useEffect(() => {
    if (!soundRef.current) return;

    if (isSoundOn) {
      soundRef.current.play();
    } else {
      soundRef.current.pause();
    }
  }, [isSoundOn]);

  const toggleSound = () => {
    // Разблокировка аудио при первом клике
    if (!Howler.ctx && soundRef.current) {
      soundRef.current.once('unlock', () => {
        setIsSoundOn(prev => !prev);
      });
    } else {
      setIsSoundOn(prev => !prev);
    }
  };

  return { isSoundOn, toggleSound };
};
