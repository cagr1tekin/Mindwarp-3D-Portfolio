import { useEffect, useState } from 'react';
import useSound from 'use-sound';

// Not: Ses dosyalarını public/sounds klasörüne eklemelisiniz
const SOUNDS = {
  BACKGROUND: '/Mindwarp-3D-Portfolio/sounds/background.mp3',
  HOVER: '/Mindwarp-3D-Portfolio/sounds/hover.mp3',
  CLICK: '/Mindwarp-3D-Portfolio/sounds/click.mp3'
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
  
  // Yeni bellek ortamı ses oynatıcısı
  const [memoryAmbience, setMemoryAmbience] = useState(null);
  
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
  
  useEffect(() => {
    try {
      // Ses dosyası mevcut olup olmadığını kontrol et
      const audioUrl = '/Mindwarp-3D-Portfolio/sounds/memory-ambience.mp3';
      const audio = new Audio();
      
      // Ses yüklenebilirlik kontrolü
      audio.addEventListener('canplaythrough', () => {
        // Ses yüklenebilirse
        audio.loop = true;
        audio.volume = 0.3;
        setMemoryAmbience(audio);
      });
      
      // Hata durumu
      audio.addEventListener('error', (e) => {
        console.warn("Bellek ortam sesi yüklenemedi, varsayılan ses kapalı moduna geçildi.");
      });
      
      // Yüklemeyi başlat
      audio.src = audioUrl;
      audio.load();
    } catch (error) {
      console.warn("Ses oluşturma hatası:", error);
    }
  }, []);
  
  useEffect(() => {
    // Eğer ses öğesi oluşturulabilmişse dinleyiciyi ekle
    if (memoryAmbience) {
      // Özel bir olay dinleyici ekleyin
      const handlePlayMemoryAmbience = () => {
        memoryAmbience.play().catch(error => {
          console.warn("Bellek ortam sesi başlatılamadı:", error);
        });
      };
      
      // DOM'a bir ID eklemeniz gerekecek
      const audioManagerElement = document.getElementById('audio-manager');
      if (audioManagerElement) {
        audioManagerElement.addEventListener('playMemoryAmbience', handlePlayMemoryAmbience);
      }
      
      return () => {
        memoryAmbience.pause();
        if (audioManagerElement) {
          audioManagerElement.removeEventListener('playMemoryAmbience', handlePlayMemoryAmbience);
        }
      };
    }
  }, [memoryAmbience]);
  
  // Bu bileşen herhangi bir UI render etmez
  return (
    <div id="audio-manager" style={{ display: 'none' }}>
      {/* Mevcut içerikler */}
    </div>
  );
} 