import { useEffect, useState } from "react";

export default function BlackFade({ show, onFadeOut }) {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let timeout;

    if (show) {
      setVisible(true);
      // Fade-in için opacity'yi bir sonraki frame'de güncelle
      requestAnimationFrame(() => {
        setOpacity(1);
      });
    } else {
      setOpacity(0);
      timeout = setTimeout(() => {
        setVisible(false);
        if (onFadeOut) onFadeOut();
      }, 1000); // 1 saniye = transition süresi
    }

    return () => clearTimeout(timeout);
  }, [show, onFadeOut]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        opacity: opacity,
        pointerEvents: "none",
        zIndex: 9999,
        transition: "opacity 1s ease-in-out",
      }}
    />
  );
}
