import React, { useEffect, useRef, useState } from 'react';
import './ModelViewer.css';

const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

const ModelViewer = ({ src, alt = '3D model', className = '', poster = null }) => {
  const mvRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    let mounted = true;
    // If model-viewer already exists, mark loaded
    if (window.customElements && window.customElements.get('model-viewer')) {
      setLoaded(true);
      return;
    }

    // inject script
    const existing = document.querySelector(`script[data-src="${MODEL_VIEWER_SRC}"]`);
    if (existing) {
      // wait for it to load
      existing.addEventListener('load', () => mounted && setLoaded(true));
      existing.addEventListener('error', () => mounted && setScriptError(true));
      return () => { mounted = false; };
    }

    const script = document.createElement('script');
    script.src = MODEL_VIEWER_SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-src', MODEL_VIEWER_SRC);

    script.onload = () => {
      try {
        if (mounted) setLoaded(true);
      } catch (e) {
        if (mounted) setScriptError(true);
      }
    };
    script.onerror = () => {
      if (mounted) setScriptError(true);
    };

    document.head.appendChild(script);

    return () => { mounted = false; };
  }, []);

  // if script failed or not supported, show poster or empty area
  if (scriptError) {
    return (
      <div className={`modelviewer-fallback ${className}`}>
        {poster ? <img src={poster} alt={alt} /> : <div className="modelviewer-placeholder">3D preview unavailable</div>}
      </div>
    );
  }

  // While loading the model-viewer script, show the poster or placeholder
  if (!loaded) {
    return (
      <div className={`modelviewer-fallback ${className}`}>
        {poster ? <img src={poster} alt={alt} /> : <div className="modelviewer-placeholder">Loading 3D preview...</div>}
      </div>
    );
  }

  // ensure the custom element uses crossorigin for model fetching
  useEffect(() => {
    try {
      const el = mvRef.current && mvRef.current.querySelector('model-viewer');
      if (el) {
        el.setAttribute('crossorigin', 'anonymous');
        // ensure poster is set as fallback source if provided
        if (poster) el.setAttribute('poster', poster);
      }
    } catch (e) {
      // ignore
    }
  }, [loaded, poster]);

  return (
    <div className={`modelviewer-wrapper ${className}`} ref={mvRef}>
      {/* Render model-viewer when script is loaded. The element is a custom element and will be upgraded once the script loads. */}
      {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
      <model-viewer
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        src={src}
        alt={alt}
        poster={poster || ''}
        ar
        auto-rotate
        camera-controls
        exposure="1"
        shadow-intensity="1"
      />
    </div>
  );
};

export default ModelViewer;
