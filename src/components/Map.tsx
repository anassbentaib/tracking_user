import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  Popup,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import L from "leaflet";
import { toast } from "sonner";
import { serverUrl } from "../config/urlConfig";
import { Trip } from "../types";
import { useRoutes } from "../contexts/RouteContext";
const { BaseLayer } = LayersControl;

const redMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapProps {
  setRecentTrip: (value: Trip) => void;
  setLoading: (value: boolean) => void;
}
const Map = ({ setRecentTrip, setLoading }: MapProps) => {
  const [contextMenu, setContextMenu] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [temporaryMarker, setTemporaryMarker] = useState<
    [number, number] | null
  >(null);
  const [from, setFrom] = useState<[number, number] | null>(null);
  const [to, setTo] = useState<[number, number] | null>(null);
  const { routes, setRoutes, selectedRoute, setSelectedRoute } = useRoutes();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setUserLocation([51.505, -0.09]); // Default location
      setMapLoaded(true);
      toast.warning("Using default location due to timeout.");
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapLoaded(true);
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error("Error getting user location:", error);
        toast.error("Location access denied. Map will load default position.");
        setUserLocation([51.505, -0.09]);
        setMapLoaded(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      contextmenu(event) {
        setContextMenu({ lat: event.latlng.lat, lng: event.latlng.lng });
        setTemporaryMarker([event.latlng.lat, event.latlng.lng]);
        setMenuPosition({
          x: event.containerPoint.x,
          y: event.containerPoint.y,
        });
      },
    });
    return null;
  };

  const handleSetRoute = (type: "from" | "to") => {
    if (!contextMenu) return;

    if (type === "from") {
      setFrom([contextMenu.lat, contextMenu.lng]);
    } else {
      setTo([contextMenu.lat, contextMenu.lng]);
    }

    setContextMenu(null);
    setMenuPosition(null);
    setTemporaryMarker(null);
  };

  useEffect(() => {
    if (from && to) {
      fetchRoutes();
    }
  }, [from, to]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/trips/new/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_location: userLocation?.join(","),
          pickup_location: from?.join(","),
          dropoff_location: to?.join(","),
          cycle_hours: 5,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data?.error);
        return;
      }
      setRecentTrip(data);
      if (data.routes?.length > 0) {
        setRoutes(data.routes);
        const shortestRouteIndex = data.routes.findIndex(
          (route: any) =>
            route.distance ===
            Math.min(...data.routes.map((r: any) => r.distance))
        );
        setSelectedRoute(shortestRouteIndex);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading map...
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-80px)] w-full">
      <MapContainer center={userLocation!} zoom={11} className="h-full w-full">
        <LayersControl position="topright">
          <BaseLayer checked name="OpenStreetMap.HOT">
            <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
          </BaseLayer>

          <BaseLayer name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </BaseLayer>
        </LayersControl>

        <MapClickHandler />

        {userLocation && (
          <Marker position={userLocation} icon={userMarker}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {temporaryMarker && (
          <Marker position={temporaryMarker} icon={redMarker}>
            <Popup>Right-click menu</Popup>
          </Marker>
        )}
        {from && (
          <Marker position={from} icon={redMarker}>
            <Popup>Route From</Popup>
          </Marker>
        )}
        {to && (
          <Marker position={to} icon={redMarker}>
            <Popup>Route To</Popup>
          </Marker>
        )}

        {routes?.length > 0 &&
          routes.map((route, idx) => (
            <Polyline
              key={idx}
              positions={route.route}
              color={idx === selectedRoute ? "red" : "#BDC3C7"}
              weight={idx === selectedRoute ? 6 : 4}
              opacity={idx === selectedRoute ? 1 : 0.6}
              eventHandlers={{
                click: () => setSelectedRoute(idx),
              }}
            />
          ))}

        {contextMenu && menuPosition && (
          <div
            className="absolute bg-white shadow-lg rounded-md p-2 text-sm border border-gray-300"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              zIndex: 1000,
            }}
          >
            <p className="font-semibold text-gray-700">Set as:</p>
            <button
              className="block w-full text-left text-blue-600 hover:bg-gray-200 px-2 py-1"
              onClick={() => handleSetRoute("from")}
            >
              Route From
            </button>
            <button
              className="block w-full text-left text-blue-600 hover:bg-gray-200 px-2 py-1"
              onClick={() => handleSetRoute("to")}
            >
              Route To
            </button>
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
