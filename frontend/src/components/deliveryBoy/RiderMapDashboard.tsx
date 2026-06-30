import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin } from 'lucide-react';

// Custom icons
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
    html: `<div style="background-color: #16a34a; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;"><div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

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

const RiderMapDashboard: React.FC<RiderMapDashboardProps> = ({ 
  tasks, 
  riderLocation,
  onTaskSelect
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Generate polyline path. Assuming tasks are ordered optimally (SSTF simulation).
  const polylinePositions = useMemo(() => {
    const points: [number, number][] = [];
    if (riderLocation) points.push([riderLocation.lat, riderLocation.lng]);
    tasks.forEach(t => points.push([t.lat, t.lng]));
    return points;
  }, [tasks, riderLocation]);

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
        <MapContainer 
          bounds={mapBounds as L.LatLngBoundsExpression}
          center={mapBounds ? undefined : [22.3569, 91.7832]}
          zoom={mapBounds ? undefined : 13}
          style={{ height: '100%', width: '100%' }} 
          scrollWheelZoom={true}
        >
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
          {riderLocation && (
            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
        </MapContainer>
        
        {riderLocation && (
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, backgroundColor: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 'bold', color: '#16a34a', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            Live Tracking Active
          </div>
        )}
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
