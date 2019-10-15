import React, { useEffect, useRef } from 'react';

import '@here/harp-datasource-protocol';
import { GeoCoordinates } from '@here/harp-geoutils';
import { GeoJsonDataProvider } from '@here/harp-geojson-datasource';
import { MapControls, MapControlsUI } from '@here/harp-map-controls';
import { CopyrightElementHandler, MapView } from '@here/harp-mapview';
import { APIFormat, OmvDataSource } from '@here/harp-omv-datasource';
import { accessToken, theme } from './config';

const initialCoordinates = new GeoCoordinates(40.707, -74.01);
const initialCameraPosition = [initialCoordinates, 3000, 50];
const geoJsonDataProvider = new GeoJsonDataProvider('offices', new URL('/resources/offices.json', window.location.href));
const geoJsonDataSource = new OmvDataSource({ name: 'offices', dataProvider: geoJsonDataProvider });

const hereCopyrightInfo = {
  id: 'here.com',
  year: new Date().getFullYear(),
  label: 'HERE',
  link: 'https://legal.here.com/terms',
};

const baseMap = new OmvDataSource({
  baseUrl: 'https://xyz.api.here.com/tiles/herebase.02',
  apiFormat: APIFormat.XYZOMV,
  styleSetName: 'tilezen',
  maxZoomLevel: 17,
  authenticationCode: accessToken,
  copyrightInfo: [hereCopyrightInfo],
});

const App = () => {
  const canvasRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const map = mapRef.current = new MapView({ theme, canvas: canvasRef.current });
    const onWindowResize = () => map.resize(window.innerWidth, window.innerHeight);

    CopyrightElementHandler.install('copyright-notice', map);

    map.addDataSource(baseMap);
    map.addDataSource(geoJsonDataSource);
    map.lookAt(...initialCameraPosition);

    window.addEventListener('resize', onWindowResize);

    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  useEffect(() => {
    if (canvasRef.current && mapRef.current) {
      const controls = new MapControls(mapRef.current);
      const uiControls = new MapControlsUI(controls);

      canvasRef.current.parentElement.appendChild(uiControls.domElement);
    }
  });

  return (
    <div className="app">
      <canvas ref={canvasRef} />
      <div id="copyright-notice"></div>
      <div className="description">
        HERE Office Locations <br /> Around the World
      </div>
    </div>
  );
};

export default App;
