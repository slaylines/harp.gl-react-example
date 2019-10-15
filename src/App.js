import React, { useEffect, useRef } from 'react';

import { GeoCoordinates } from '@here/harp-geoutils';
import { GeoJsonDataProvider } from '@here/harp-geojson-datasource';
import { MapControls, MapControlsUI } from '@here/harp-map-controls';
import { CopyrightElementHandler, MapView } from '@here/harp-mapview';
import { APIFormat, OmvDataSource } from '@here/harp-omv-datasource';
import { accessToken, theme } from './config';

const initialCoordinates = new GeoCoordinates(52.53102, 13.3848);
const initialZoomLevel = 5;
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

const styleSet = [
  {
    when: '$geometryType == "point"',
    technique: 'circles',
    attr: {
      color: '#01a39c',
      size: 48,
      renderOrder: 100,
    },
  },
  {
    when: '$geometryType == "line"',
    technique: 'solid-line',
    attr: {
      color: '#f8bc02',
      lineWidth: 10,
      metricUnit: 'Pixel',
      renderOrder: 100,
    },
  },
];

const App = () => {
  const canvasRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const map = mapRef.current = new MapView({ theme, canvas: canvasRef.current });
    const onWindowResize = () => map.resize(window.innerWidth, window.innerHeight);

    CopyrightElementHandler.install('copyright-notice', map);

    map.addDataSource(baseMap);
    map.addDataSource(geoJsonDataSource).then(() => geoJsonDataSource.setStyleSet(styleSet));
    map.setCameraGeolocationAndZoom(initialCoordinates, initialZoomLevel);

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
