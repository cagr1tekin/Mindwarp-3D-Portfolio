import { useEffect } from 'react';
import useSound from 'use-sound';

// Not: Ses dosyalarını public/sounds klasörüne eklemelisiniz
const SOUNDS = {
  BACKGROUND: '/sounds/background.mp3',
  HOVER: '/sounds/hover.mp3',
  CLICK: '/sounds/click.mp3'
};

export default function AudioManager() {
  // Arkaplan müziği
  const [playBackground, { stop: stopBackground }] = useSound(SOUNDS.BACKGROUND, { 
    volume: 0.2,
    loop: true
  });
  
  // Buton hover sesi
  const [playHover] = useSound(SOUNDS.HOVER, { 
    volume: 0.3 
  });
  
  // Buton tıklama sesi
  const [playClick] = useSound(SOUNDS.CLICK, { 
    volume: 0.3 
  });
  
  // Komponent mount olduğunda arkaplan müziğini başlat
  useEffect(() => {
    // Kullanıcı etkileşimini bekleyen bir yaklaşım 
    // (tarayıcılar otomatik ses oynatmayı engelleyebilir)
    const handleFirstInteraction = () => {
      playBackground();
      window.removeEventListener('click', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    
    // Temizleme işlevi
    return () => {
      stopBackground();
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [playBackground, stopBackground]);
  
  // Buton hover olaylarını dinle
  useEffect(() => {
    const buttons = document.querySelectorAll('button');
    
    const handleMouseEnter = () => {
      playHover();
    };
    
    const handleClick = () => {
      playClick();
    };
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('click', handleClick);
    });
    
    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('click', handleClick);
      });
    };
  }, [playHover, playClick]);
  
  // Bu bileşen herhangi bir UI render etmez
  return null;
} 