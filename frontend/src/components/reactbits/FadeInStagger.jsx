import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const FadeInStagger = ({
  as: Tag = 'div',
  className = '',
  delay = 0,
  stagger = 0.06,
  duration = 0.5,
  y = 16,
  children,
}) => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll('[data-fade-item]');
      if (!items.length) return;

      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: 'power3.out',
          stagger,
          delay,
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <Tag
      ref={containerRef}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} data-fade-item>
              {child}
            </div>
          ))
        : (
          <div data-fade-item>
            {children}
          </div>
        )}
    </Tag>
  );
};

export default FadeInStagger;

