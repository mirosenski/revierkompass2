import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { MAPBOX_TOKEN, MAP_STYLE } from '../config/map.config';

const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE.streets,
      center: [7.0, 51.0],
      zoom: 6
    });

    // Füge den Geocoder hinzu
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any, // TypeScript-Hack für die Kompatibilität
      placeholder: 'Suche nach einem Ort...',
      language: 'de',
      countries: 'de',
      types: 'place,address,poi'
    });

    map.addControl(geocoder);

    // Speichere die Map-Referenz
    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }} 
    />
  );
};

export default Map; 