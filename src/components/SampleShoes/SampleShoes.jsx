import React from 'react';
import './SampleShoes.css';
import shoe1 from '../../assets/hero-shoe1.svg';
import shoe2 from '../../assets/hero-shoe2.svg';
import shoe3 from '../../assets/hero-shoe3.svg';

const SampleShoes = ({ variant = 'grid', heroImage }) => {
  const shoes = [shoe1, shoe2, shoe3, shoe2, shoe1, shoe3];
  const HERO_FALLBACK = heroImage || "https://cdn.builder.io/api/v1/image/assets%2Fd7feb1a142b342fbacaee745f4047570%2F7526e605ff9941be9e97090906d8fa04?format=webp&width=800";

  if (variant === 'hero') {
    return (
      <section className={`sample-shoes sample-shoes-${variant}`} aria-hidden>
        <div className="sample-hero-wrap">
          <img src={HERO_FALLBACK} alt="hero" className="sample-hero-image" />
        </div>
      </section>
    );
  }

  return (
    <section className={`sample-shoes sample-shoes-${variant}`} aria-hidden>
      <div className="sample-inner">
        {shoes.map((s, i) => (
          <div key={i} className="sample-item">
            <img src={s} alt={`sample-${i}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SampleShoes;
