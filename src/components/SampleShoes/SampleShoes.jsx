import React from 'react';
import './SampleShoes.css';
import shoe1 from '../../assets/hero-shoe1.svg';
import shoe2 from '../../assets/hero-shoe2.svg';
import shoe3 from '../../assets/hero-shoe3.svg';

const SampleShoes = ({ variant = 'grid' }) => {
  const shoes = [shoe1, shoe2, shoe3, shoe2, shoe1, shoe3];
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
