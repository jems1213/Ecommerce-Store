import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FiArrowRight, FiPlay, FiPause } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Hero.css';
import ThreeShoe from '../ThreeShoe/ThreeShoe';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const controls = useAnimation();

  const slides = [
    {
      title: "Step Into Style",
      subtitle: "NEW COLLECTION 2025",
      description: "Discover the latest trends in premium footwear",
      cta: "Shop Now",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
      bgColor: "#f5f5f5",
      textColor: "#000",
      threeD: true,
      color: '#ff6b35',
      accent: '#1b1b1b',
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Shoe/glTF-Binary/Shoe.glb',
      lighting: { ambient: 0.55, key: 0.9, keyPos: [4, 8, 4], fill: 0.25 }
    },
    {
      title: "Executive Collection",
      subtitle: "BUSINESS ELEGANCE",
      description: "Professional footwear for the modern executive",
      cta: "Explore",
      image: "https://wallpapercave.com/wp/wp2896922.jpg",
      bgColor: "#000000",
      textColor: "#fff",
      threeD: true,
      color: '#ffffff',
      accent: '#e74c3c',
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Shoe/glTF-Binary/Shoe.glb',
      lighting: { ambient: 0.45, key: 1.1, keyPos: [6, 12, 6], fill: 0.35 }
    },
    {
      title: "Performance Engineered",
      subtitle: "ATHLETIC INNOVATION",
      description: "Cutting-edge technology for peak performance",
      cta: "View Tech",
      image: "https://www.freepnglogos.com/uploads/shoes-png/download-nike-shoes-transparent-png-for-designing-projects-16.png",
      bgColor: "#e74c3c",
      textColor: "#fff",
      threeD: true,
      color: '#0d6efd',
      accent: '#0b2545',
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Shoe/glTF-Binary/Shoe.glb'
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, autoPlay]);

  const nextSlide = () => {
    controls.start({
      opacity: 0,
      transition: { duration: 0.3 }
    }).then(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      controls.start({
        opacity: 1,
        transition: { duration: 0.6 }
      });
    });
  };

  const prevSlide = () => {
    controls.start({
      opacity: 0,
      transition: { duration: 0.3 }
    }).then(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      controls.start({
        opacity: 1,
        transition: { duration: 0.6 }
      });
    });
  };

  const goToSlide = (index) => {
    controls.start({
      opacity: 0,
      transition: { duration: 0.3 }
    }).then(() => {
      setCurrentSlide(index);
      controls.start({
        opacity: 1,
        transition: { duration: 0.6 }
      });
    });
  };

  return (
    <motion.section 
      className={`hero hero-variant-${currentSlide}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="hero-container">
        {/* Content */}
        <motion.div 
          className="hero-content"
          animate={controls}
          key={`content-${currentSlide}`}
        >
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hero-subtitle"
          >
            {slides[currentSlide].subtitle}
          </motion.h2>
          
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hero-title"
          >
            {slides[currentSlide].title.split(' ').map((word, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + (i * 0.1), duration: 0.6 }}
              >
                {word}{' '}
              </motion.span>
            ))}
          </motion.h1>
          
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="hero-text"
          >
            {slides[currentSlide].description}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hero-button"
              >
                {slides[currentSlide].cta} <FiArrowRight className="button-icon" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Image / 3D canvas */}
        <motion.div
          className="hero-image-container"
          animate={controls}
          key={`image-${currentSlide}`}
        >
          {/* Render a 3D shoe for slides that enable it, otherwise fallback to image */}
          {slides[currentSlide].threeD ? (
            <ThreeShoe
              className="hero-3d"
              color={slides[currentSlide].color}
              accent={slides[currentSlide].accent}
              modelUrl={slides[currentSlide].modelUrl}
              lighting={slides[currentSlide].lighting}
            />
          ) : (
            <motion.img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="hero-image"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

        </motion.div>
      </div>

      {/* Controls */}
      <div className="hero-controls">
        <button 
          className="control-button prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          &lt;
        </button>
        
        <div className="pagination-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <button 
          className="control-button next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          &gt;
        </button>
        
        <button 
          className="autoplay-button"
          onClick={() => setAutoPlay(!autoPlay)}
          aria-label={autoPlay ? 'Pause slideshow' : 'Play slideshow'}
        >
          {autoPlay ? <FiPause /> : <FiPlay />}
        </button>
      </div>
    </motion.section>
  );
};

export default Hero;
