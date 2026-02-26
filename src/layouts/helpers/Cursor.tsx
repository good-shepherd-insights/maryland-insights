import React, { useEffect, useRef, useState } from 'react';

interface CursorProps {
  text: string;
  color?: string;
  arrowPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  delay?: number;
}

const Cursor: React.FC<CursorProps> = ({
  text,
  color,
  arrowPosition = "top-left",
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Smooth interpolation for mouse tracking
  useEffect(() => {
    const animate = () => {
      setCurrentPosition(prev => {
        const dx = targetPosition.current.x - prev.x;
        const dy = targetPosition.current.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Stop animation when very close to target and not hovered
        if (distance < 0.1 && !isHovered && targetPosition.current.x === 0 && targetPosition.current.y === 0) {
          return { x: 0, y: 0 };
        }

        // Use higher interpolation for smoother movement
        const factor = 0.2;
        return {
          x: prev.x + dx * factor,
          y: prev.y + dy * factor
        };
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    targetPosition.current = {
      x: (e.clientX - centerX) * 0.25,
      y: (e.clientY - centerY) * 0.25
    };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    targetPosition.current = { x: 0, y: 0 };
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute z-0";
    const positionClasses = {
      "bottom-right": "-top-1 -right-5",
      "bottom-left": "-top-1 -left-5 scale-x-[-1]",
      "top-right": "-bottom-1 -left-1 rotate-180 scale-x-[-1]",
      "top-left": "-bottom-1 -left-5 rotate-180"
    };
    return `${baseClasses} ${positionClasses[arrowPosition]}`;
  };

  return (
    <div
      ref={containerRef}
      className='relative cursor-pointer'
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        animation: !isHovered ? `cursorFloat 5s ease-in-out infinite` : 'none',
        animationDelay: `${delay}s`,
        transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
        willChange: 'transform'
      }}
    >
      <p
        className="inline-block relative z-10 px-4 py-1 rounded-md"
        style={{ background: color }}
      >
        {text}
      </p>

      <svg
        className={getArrowClasses()}
        width="108"
        height="69"
        viewBox="0 0 108 69"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M91.1207 58.2461L83.8407 54.1118C81.3618 52.704 80.1223 52.0001 79.8071 51.1626C79.5333 50.4352 79.6174 49.6215 80.034 48.9655C80.5138 48.2101 81.871 47.7744 84.5853 46.903L84.5853 46.903L85.8327 46.5026L85.8327 46.5026C86.2661 46.3635 86.4828 46.2939 86.6798 46.1886C86.8547 46.0952 87.0177 45.9811 87.1653 45.8487C87.3316 45.6996 87.471 45.5198 87.75 45.1601L87.75 45.1601L88.5529 44.1249C90.3001 41.8722 91.1737 40.7459 92.0476 40.5535C92.8066 40.3863 93.6 40.5857 94.1898 41.0917C94.869 41.6743 95.1066 43.0798 95.5816 45.8907L96.9767 54.1457L96.9767 54.1457C97.4204 56.7711 97.6422 58.0838 97.2183 58.8434C96.8498 59.5039 96.1992 59.9594 95.4525 60.0799C94.5937 60.2184 93.4361 59.561 91.1207 58.2461Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

export default Cursor;
