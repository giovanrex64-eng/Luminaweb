
import React from 'react';
import useIntersectionObserver from './useIntersectionObserver';

const AnimatedSection = ({ children }) => {
  const [elementRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section
      ref={elementRef}
      className={`page-section ${isVisible ? 'is-visible' : ''}`}
    >
      {children}
    </section>
  );
};

export default AnimatedSection;
