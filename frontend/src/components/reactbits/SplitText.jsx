import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const SplitText = ({
  text,
  as: Tag = 'h1',
  className = '',
  delay = 50,
  duration = 0.6,
  ease = 'power3.out',
}) => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const chars = containerRef.current.querySelectorAll('[data-split-char]');
      if (!chars.length) return;

      gsap.fromTo(
        chars,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration,
          ease,
          stagger: delay / 1000,
        },
      );
    },
    { dependencies: [text], scope: containerRef },
  );

  return (
    <Tag
      ref={containerRef}
      className={['inline-block align-top', className].filter(Boolean).join(' ')}
    >
      {text.split('').map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          data-split-char
          className="inline-block will-change-transform"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;

