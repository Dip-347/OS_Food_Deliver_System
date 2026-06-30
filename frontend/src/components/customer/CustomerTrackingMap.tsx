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

// Smaller custom icons for better aesthetics
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const restaurantIcon = createCustomIcon('#ea580c'); // Orange
const customerIcon = createCustomIcon('#3b82f6'); // Blue
const riderIcon = L.divIcon({
    className: 'rider-icon',
    html: `<div style="background-color: #16a34a; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;"><div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

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
