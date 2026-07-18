import { MapContainer, TileLayer, Marker } from "react-leaflet";

export default function MapPreview({
  lat,
  long,
}: {
  lat: number;
  long: number;
}) {
  return (
    <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-600">
      <MapContainer
        center={[lat, long]}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, long]} />
      </MapContainer>
    </div>
  );
}
