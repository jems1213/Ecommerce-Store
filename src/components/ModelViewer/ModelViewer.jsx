import React, { useEffect, useRef, useState } from 'react';
import './ModelViewer.css';

const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

const ModelViewer = ({ src, alt = '3D model', className = '', poster = null, autoRotate = true, rotationPerSecond = '30deg' }) => {
  const mvRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(max-width: 576px)');
    const setMatch = () => setIsSmallScreen(!!(mq && mq.matches));
    setMatch();
    if (mq && mq.addEventListener) mq.addEventListener('change', setMatch);
    else if (mq && mq.addListener) mq.addListener(setMatch);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', setMatch);
      else if (mq && mq.removeListener) mq.removeListener(setMatch);
    };
  }, []);

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
      existing.addEventListener('load', () => mounted && setLoaded(true));
      existing.addEventListener('error', () => mounted && setScriptError(true));
      return () => { mounted = false; };
    }

    const moduleSrc = MODEL_VIEWER_SRC;
    const legacySrc = 'https://unpkg.com/@google/model-viewer/dist/model-viewer-legacy.js';

    const moduleScript = document.createElement('script');
    moduleScript.src = moduleSrc;
    moduleScript.type = 'module';
    moduleScript.async = true;
    moduleScript.crossOrigin = 'anonymous';
    moduleScript.setAttribute('data-src', moduleSrc);

    const legacyScript = document.createElement('script');
    legacyScript.src = legacySrc;
    legacyScript.noModule = true;
    legacyScript.async = true;
    legacyScript.crossOrigin = 'anonymous';
    legacyScript.setAttribute('data-src', legacySrc);

    const onLoad = () => {
      try {
        if (mounted) setLoaded(true);
      } catch (e) {
        if (mounted) setScriptError(true);
      }
    };

    moduleScript.addEventListener('load', onLoad);
    moduleScript.addEventListener('error', () => { if (mounted) setScriptError(true); });
    legacyScript.addEventListener('load', onLoad);
    legacyScript.addEventListener('error', () => { if (mounted) setScriptError(true); });

    document.head.appendChild(moduleScript);
    document.head.appendChild(legacyScript);

    return () => { mounted = false; };
  }, []);

  // Create/replace the model-viewer element whenever src/poster/alt/loaded changes
  useEffect(() => {
    if (!loaded || !mvRef.current || isSmallScreen) return;
    const container = mvRef.current;

    // remove existing children to ensure a fresh element
    while (container.firstChild) container.removeChild(container.firstChild);

    const el = document.createElement('model-viewer');
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.minHeight = '180px';
    el.style.background = 'transparent';

    if (src) el.setAttribute('src', src);
    if (alt) el.setAttribute('alt', alt);
    if (poster) el.setAttribute('poster', poster);

    // Improve mobile visibility and reduce interaction overlays
    el.setAttribute('ar', '');
    if (autoRotate) el.setAttribute('auto-rotate', '');
    if (rotationPerSecond) el.setAttribute('rotation-per-second', rotationPerSecond);
    el.setAttribute('camera-controls', '');
    el.setAttribute('interaction-prompt', 'none');
    el.setAttribute('reveal', 'auto');
    el.setAttribute('exposure', '1');
    el.setAttribute('shadow-intensity', '1');
    el.setAttribute('crossorigin', 'anonymous');

    // Listen for model load to ensure it becomes visible; if it fails, fall back to poster
    const onModelLoad = () => {
      // nothing for now, but could toggle a state if needed
    };
    const onModelError = () => {
      setScriptError(true);
    };

    el.addEventListener('load', onModelLoad);
    el.addEventListener('error', onModelError);

    container.appendChild(el);

    return () => {
      el.removeEventListener('load', onModelLoad);
      el.removeEventListener('error', onModelError);
      if (container.contains(el)) container.removeChild(el);
    };
  }, [src, poster, alt, loaded, isSmallScreen]);

  // if script failed or not supported, show poster or empty area
  if (scriptError) {
    return (
      <div className={`modelviewer-fallback ${className}`}>
        {poster ? <img src={poster} alt={alt} /> : <div className="modelviewer-placeholder">3D preview unavailable</div>}
      </div>
    );
  }

  // On small screens prefer the poster image to ensure visibility
  if (isSmallScreen) {
    return (
      <div className={`modelviewer-fallback ${className}`}>
        {poster ? <img src={poster} alt={alt} /> : <div className="modelviewer-placeholder">3D preview unavailable on mobile</div>}
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

  return <div className={`modelviewer-wrapper ${className}`} ref={mvRef} />;
};

export default ModelViewer;
