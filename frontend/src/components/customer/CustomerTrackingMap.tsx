import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue if needed
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createPinIcon = (color: string, svgContent: string) => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="width: 36px; height: 36px; background-color: ${color}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 3px 3px 6px rgba(0,0,0,0.4);">
        <div style="transform: rotate(45deg); background-color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          ${svgContent}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const restaurantIcon = createPinIcon('#ea580c', `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`);
const customerIcon = createPinIcon('#3b82f6', `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`);

// Keep rider as the expressive emoji or update if needed (using scooter)
const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    className: 'custom-emoji-icon',
    html: `<div style="font-size: 32px; filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.4)); text-align: center; line-height: 1;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};
const riderIcon = createEmojiIcon('🛵');

interface CustomerTrackingMapProps {
  restaurantLocation?: { lat: number; lng: number };
  customerLocation?: { lat: number; lng: number };
  riderLocation?: { lat: number; lng: number } | null;
  status: string;
}

const CustomerTrackingMap: React.FC<CustomerTrackingMapProps> = ({ 
  restaurantLocation, 
  customerLocation, 
  riderLocation, 
  status 
}) => {
  
  // Calculate Progress Percentage
  const progressPercentage = useMemo(() => {
    if (!restaurantLocation || !customerLocation || !riderLocation) return 0;
    if (status === 'delivered') return 100;
    
    // Very basic distance calculation just for visual progress
    const dxTotal = customerLocation.lng - restaurantLocation.lng;
    const dyTotal = customerLocation.lat - restaurantLocation.lat;
    const totalDist = Math.sqrt(dxTotal * dxTotal + dyTotal * dyTotal);
    
    if (totalDist === 0) return 100;

    const dxRider = riderLocation.lng - restaurantLocation.lng;
    const dyRider = riderLocation.lat - restaurantLocation.lat;
    const riderDist = Math.sqrt(dxRider * dxRider + dyRider * dyRider);
    
    // Cap at 100% just in case
    return Math.min(Math.max(Math.round((riderDist / totalDist) * 100), 0), 100);
  }, [restaurantLocation, customerLocation, riderLocation, status]);

  const mapBounds = useMemo(() => {
    const points: [number, number][] = [];
    if (restaurantLocation) points.push([restaurantLocation.lat, restaurantLocation.lng]);
    if (customerLocation) points.push([customerLocation.lat, customerLocation.lng]);
    if (riderLocation) points.push([riderLocation.lat, riderLocation.lng]);
    return points.length > 1 ? points : undefined;
  }, [restaurantLocation, customerLocation, riderLocation]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <MapContainer 
          bounds={mapBounds as L.LatLngBoundsExpression}
          center={mapBounds ? undefined : [0, 0]}
          zoom={mapBounds ? undefined : 2}
          style={{ height: '100%', width: '100%' }} 
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {restaurantLocation && customerLocation && (
            <Polyline 
              positions={[
                [restaurantLocation.lat, restaurantLocation.lng],
                [customerLocation.lat, customerLocation.lng]
              ]} 
              color="#94a3b8" 
              weight={3} 
              dashArray="5, 10" 
            />
          )}

          {restaurantLocation && (
            <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}>
              <Popup>Restaurant</Popup>
            </Marker>
          )}

          {customerLocation && (
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {riderLocation && (
            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
              <Popup>Your Courier is {progressPercentage}% there!</Popup>
            </Marker>
          )}
        </MapContainer>
        
        {/* Rider Badge Overlay */}
        {riderLocation && (
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, backgroundColor: 'white', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 'bold', color: '#16a34a', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            Your Courier is {status.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Progress Bar at Bottom */}
      {riderLocation && (
        <div style={{ padding: '12px 16px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>
            <span>Preparing</span>
            <span>{progressPercentage}% Completed</span>
            <span>Delivered</span>
          </div>
          <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${progressPercentage}%`, 
              backgroundColor: '#16a34a', 
              height: '100%', 
              transition: 'width 1s ease-in-out' 
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTrackingMap;
