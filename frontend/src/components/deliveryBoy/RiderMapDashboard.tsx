import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin } from 'lucide-react';

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

interface Task {
  id: string;
  type: 'pickup' | 'delivery';
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  orderId: string;
}

interface RiderMapDashboardProps {
  tasks: Task[];
  riderLocation?: { lat: number; lng: number } | null;
  onTaskSelect?: (taskId: string) => void;
}

function MapController({ flyTo }: { flyTo: {lat: number, lng: number, timestamp: number} | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 15);
    }
  }, [flyTo, map]);
  return null;
}

const RiderMapDashboard: React.FC<RiderMapDashboardProps> = ({ 
  tasks, 
  riderLocation,
  onTaskSelect
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Geolocation state
  const [liveLocation, setLiveLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<{lat: number, lng: number, timestamp: number} | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLiveLocation({ lat, lng });
        setFlyToLocation({ lat, lng, timestamp: Date.now() });
        setLocating(false);
        
        if (watchIdRef.current === null) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => setLiveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error("GPS Watch error:", err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
          );
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please check browser permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Use live location if available, fallback to prop riderLocation
  const displayLocation = liveLocation || riderLocation;

  // Generate polyline path. Assuming tasks are ordered optimally (SSTF simulation).
  const polylinePositions = useMemo(() => {
    const points: [number, number][] = [];
    if (displayLocation) points.push([displayLocation.lat, displayLocation.lng]);
    tasks.forEach(t => points.push([t.lat, t.lng]));
    return points;
  }, [tasks, displayLocation]);

  const mapBounds = useMemo(() => {
    const points: [number, number][] = polylinePositions;
    return points.length > 1 ? points : undefined;
  }, [polylinePositions]);

  return (
    <div style={{ display: 'flex', height: '500px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      {/* Sidebar: Task List */}
      <div style={{ width: '350px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#16a34a', borderRadius: '50%' }}></span>
            Active Tasks ({tasks.length})
          </h3>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}>
          {tasks.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '20px' }}>No active tasks.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.map((task, index) => (
                <div 
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    if (onTaskSelect) onTaskSelect(task.id);
                  }}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: `1px solid ${selectedTaskId === task.id ? 'var(--primary)' : '#e2e8f0'}`,
                    backgroundColor: selectedTaskId === task.id ? 'rgba(var(--primary-rgb), 0.05)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      backgroundColor: task.type === 'pickup' ? '#ea580c' : '#3b82f6', 
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '0.8rem', fontWeight: 'bold' 
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ fontWeight: 'bold', color: task.type === 'pickup' ? '#ea580c' : '#3b82f6', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      {task.type}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{task.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{task.subtitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Map */}
      <div style={{ flexGrow: 1, position: 'relative' }}>
        
        {/* Floating Controls */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={startTracking}
            disabled={locating}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              padding: '8px 16px', fontSize: '0.85rem', fontWeight: 'bold',
              backgroundColor: 'white', border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#334155'
            }}
          >
            <Navigation size={16} color={liveLocation ? '#16a34a' : 'currentColor'} /> 
            {locating ? 'Locating...' : 'Find My Location'}
          </button>

          {displayLocation && (
            <div style={{ backgroundColor: 'white', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold', color: '#16a34a', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              Live Tracking Active
            </div>
          )}
        </div>

        <MapContainer 
          bounds={mapBounds as L.LatLngBoundsExpression}
          center={mapBounds ? undefined : [22.3569, 91.7832]}
          zoom={mapBounds ? undefined : 13}
          style={{ height: '100%', width: '100%' }} 
          scrollWheelZoom={true}
        >
          <MapController flyTo={flyToLocation} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Dispatch Path */}
          {polylinePositions.length > 1 && (
            <Polyline 
              positions={polylinePositions} 
              color="#3b82f6" 
              weight={3} 
              dashArray="5, 10" 
              opacity={0.7}
            />
          )}

          {/* Zones and Markers */}
          {tasks.map(task => (
            <React.Fragment key={task.id}>
              <Circle 
                center={[task.lat, task.lng]} 
                radius={200} 
                pathOptions={{ 
                  color: task.type === 'pickup' ? '#ea580c' : '#3b82f6', 
                  fillColor: task.type === 'pickup' ? '#ea580c' : '#3b82f6', 
                  fillOpacity: 0.1, 
                  weight: 1 
                }} 
              />
              <Marker 
                position={[task.lat, task.lng]} 
                icon={task.type === 'pickup' ? restaurantIcon : customerIcon}
              >
                <Popup>
                  <strong>{task.title}</strong><br/>{task.subtitle}
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* Rider Marker */}
          {displayLocation && (
            <Marker position={[displayLocation.lat, displayLocation.lng]} icon={riderIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>
    </div>
  );
};

export default RiderMapDashboard;
