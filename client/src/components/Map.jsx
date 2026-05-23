import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red hospital marker
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom blue donor marker
const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const Map = ({ hospitals = [], donorLocation = null, height = '400px', isDark = true }) => {
  const defaultCenter = donorLocation || [20.5937, 78.9629];
  const zoom = donorLocation ? 12 : 5;

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '16px', zIndex: 1 }}
      scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        url={tileUrl}
      />

      {/* Donor location */}
      {donorLocation && (
        <>
          <Marker position={donorLocation} icon={donorIcon}>
            <Popup>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
                <strong>📍 Your Location</strong>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={donorLocation}
            radius={5000}
            pathOptions={{ color: '#4488ff', fillColor: '#4488ff', fillOpacity: 0.08, weight: 1 }}
          />
        </>
      )}

      {/* Hospital markers */}
      {hospitals.map((hospital, i) => (
        <Marker key={i} position={hospital.coords} icon={hospitalIcon}>
          <Popup>
            <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '160px' }}>
              <strong style={{ color: '#C1121F', fontSize: '14px' }}>🏥 {hospital.name}</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>📍 {hospital.city}</span>
              <br />
              <span style={{ fontSize: '12px' }}>
                🩸 <strong style={{ color: '#C1121F' }}>{hospital.bloodGroup}</strong> needed
              </span>
              <br />
              <span style={{ fontSize: '11px', color: '#888' }}>⚡ {hospital.urgency}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;