import { useEffect, useState, useRef } from 'react';

// Basit FPS Sayacı
class FPSCounter {
  constructor() {
    this.fps = 0;
    this.frames = 0;
    this.lastTime = performance.now();
  }
  
  update() {
    const time = performance.now();
    this.frames++;
    
    if (time >= this.lastTime + 1000) {
      this.fps = (this.frames * 1000) / (time - this.lastTime);
      this.lastTime = time;
      this.frames = 0;
      return true; // FPS değeri güncellendi
    }
    
    return false; // FPS değeri güncellenmedi
  }
  
  getFPS() {
    return Math.round(this.fps);
  }
}

export default function FPSMonitor({ visible = true }) {
  const [fps, setFps] = useState(0);
  const counterRef = useRef(new FPSCounter());
  
  // FPS sayacını bir kez oluştur ve requestAnimationFrame ile güncellemeleri yap
  useEffect(() => {
    if (!visible) return;
    
    let frameId;
    const fpsCounter = counterRef.current;
    
    const updateFPS = () => {
      // Sadece gerçekten değer değiştiğinde state'i güncelle
      if (fpsCounter.update()) {
        setFps(fpsCounter.getFPS());
      }
      
      frameId = requestAnimationFrame(updateFPS);
    };
    
    frameId = requestAnimationFrame(updateFPS);
    
    // Temizleme
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [visible]);
  
  // Eğer görünür değilse bir şey render etme
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.5)',
        color: fps > 50 ? '#4caf50' : fps > 30 ? '#ff9800' : '#f44336',
        padding: '5px 10px',
        fontSize: '14px',
        fontFamily: 'monospace',
        borderRadius: '4px',
        zIndex: 1000,
      }}
    >
      FPS: {fps}
    </div>
  );
} 