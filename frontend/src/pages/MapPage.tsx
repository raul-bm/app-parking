import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import PinDetailModal from "../components/PinDetailModal";
import { useAuth } from "../context/AuthContext";

const DefaultIcon = L.icon({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FlyToCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

function MapClickHandler({
  onClick,
}: {
  onClick: (latlng: [number, number]) => void;
}) {
  useMapEvents({
    click: (e) => onClick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [pins, setPins] = useState<any[]>([]);
  const [clickedLocation, setClickedLocation] = useState<
    [number, number] | null
  >(null);
  const [note, setNote] = useState("");
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log("Location denied"),
      { enableHighAccuracy: true },
    );

    api("/pins").then(setPins).catch(console.log);
  }, []);

  const lastPin = pins.length > 0 ? pins[0] : null;

  async function createPin(lat: number, long: number) {
    try {
      await api("/pins", {
        method: "POST",
        body: JSON.stringify({ lat, long, note: note || undefined }),
      });
      setNote("");
      setClickedLocation(null);
      const updated = await api("/pins");
      setPins(updated);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePin(pinId: number) {
    try {
      await api(`/pins/${pinId}`, { method: "DELETE" });
      setPins((prev) => prev.filter((p) => p.id !== pinId));
    } catch (err) {
      console.error(err);
    }
  }

  const mapRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const isOutsideMap = mapRef.current && !mapRef.current.contains(target);
      const isInsideControls = controlsRef.current?.contains(target);

      if (isOutsideMap && !isInsideControls) {
        setClickedLocation(null);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex-1 p-4 flex items-center justify-center">
        <div
          ref={mapRef}
          className="w-full max-w-3xl h-full max-h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-700"
        >
          {userLocation ? (
            <MapContainer
              center={userLocation}
              zoom={15}
              className="h-full w-full"
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FlyToCenter center={userLocation} />
              <MapClickHandler onClick={setClickedLocation} />
              <CircleMarker
                center={userLocation}
                radius={10}
                pathOptions={{
                  color: "#7c3aed",
                  fillColor: "#a855f7",
                  fillOpacity: 0.6,
                }}
              />

              {clickedLocation && (
                <CircleMarker
                  center={clickedLocation}
                  radius={9}
                  pathOptions={{
                    color: "#059669",
                    fillColor: "#10b981",
                    fillOpacity: 0.4,
                    weight: 3,
                  }}
                />
              )}

              {lastPin && (
                <Marker
                  position={[lastPin.lat, lastPin.long]}
                  eventHandlers={{ click: () => setSelectedPin(lastPin) }}
                />
              )}
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              Getting your location...
            </div>
          )}
        </div>
      </div>

      <div ref={controlsRef}>
        <div className="px-4 pb-2">
          <input
            type="text"
            placeholder="Add a note (e.g. parking spot number)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="px-4 pb-4">
          {clickedLocation && (
            <button
              onClick={() => createPin(clickedLocation[0], clickedLocation[1])}
              className="w-full mb-2 py-4 flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold
              shadow-lg hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all duration-200 cursor-
              pointer"
            >
              Park at selected point
            </button>
          )}
          <button
            onClick={() =>
              userLocation && createPin(userLocation[0], userLocation[1])
            }
            disabled={!userLocation}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-
            lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-500 hover:to-indigo-500
            active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Park in your location
          </button>
        </div>
      </div>
      <PinDetailModal
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        onDelete={
          selectedPin && user?.id === selectedPin.ownerId
            ? handleDeletePin
            : undefined
        }
        onUpdate={(pinId, updatedPin) => {
          setPins((prev) => prev.map((p) => (p.id === pinId ? updatedPin : p)));
        }}
      />
    </div>
  );
}
