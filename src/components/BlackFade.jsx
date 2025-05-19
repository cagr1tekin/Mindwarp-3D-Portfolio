import { useEffect, useState } from "react";

export default function BlackFade({ show, duration = 1000 }) {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (show) {
      setVisible(true);
      requestAnimationFrame(() => {
        setOpacity(1); // fade-in
      });
    } else {
      setOpacity(0); // fade-out
      const timeout = setTimeout(() => {
        setVisible(false); // DOM'dan çıkar
      }, duration); // fade-out süresi
      return () => clearTimeout(timeout);
    }
  }, [show, duration]);

  if (!visible && opacity === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        opacity,
        transition: `opacity ${duration}ms ease-in-out`, // Süre dinamik
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
