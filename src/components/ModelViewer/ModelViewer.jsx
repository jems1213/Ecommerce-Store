import React, { useEffect, useRef, useState } from 'react';
import './ModelViewer.css';

const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

const ModelViewer = ({ src, alt = '3D model', className = '', poster = null, autoRotate = true, rotationPerSecond = '30deg' }) => {
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
    if (!loaded || !mvRef.current) return;
    const container = mvRef.current;

    // remove existing children to ensure a fresh element
    while (container.firstChild) container.removeChild(container.firstChild);

    const el = document.createElement('model-viewer');
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.background = 'transparent';

    if (src) el.setAttribute('src', src);
    if (alt) el.setAttribute('alt', alt);
    if (poster) el.setAttribute('poster', poster);

    el.setAttribute('ar', '');
    if (autoRotate) el.setAttribute('auto-rotate', '');
    if (rotationPerSecond) el.setAttribute('rotation-per-second', rotationPerSecond);
    el.setAttribute('camera-controls', '');
    el.setAttribute('exposure', '1');
    el.setAttribute('shadow-intensity', '1');
    el.setAttribute('crossorigin', 'anonymous');

    container.appendChild(el);

    return () => {
      if (container.contains(el)) container.removeChild(el);
    };
  }, [src, poster, alt, loaded]);

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

  return <div className={`modelviewer-wrapper ${className}`} ref={mvRef} />;
};

export default ModelViewer;
