import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import MapPreview from "../components/MapPreview";
import PinDetailModal from "../components/PinDetailModal";

export default function HistoryPage() {
  const { user } = useAuth();
  const [pins, setPins] = useState<any[]>([]);
  const [selectedPin, setSelectedPin] = useState<any>(null);

  useEffect(() => {
    api("/pins")
      .then((data) => {
        const myPins = data.filter((p: any) => p.ownerId === user?.id);
        setPins(myPins);
      })
      .catch(console.log);
  }, [user]);

  async function handleDeletePin(pinId: number) {
    try {
      await api(`/pins/${pinId}`, { method: "DELETE" });
      setPins((prev) => prev.filter((p) => p.id !== pinId));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="h-full bg-gray-900 p-4 overflow-y-auto">
      <h1 className="text-white text-2xl font-bold mb-4 text-center mt-4">
        History
      </h1>

      {pins.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No pins yet</p>
      ) : (
        <div className="space-y-3">
          {pins.map((pin) => (
            <div
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer
                  hover:bg-gray-750 transition-colors border border-gray-700"
            >
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs">
                  {new Date(pin.createdAt).toLocaleString()}
                </p>
                <p className="text-white mt-1 truncate">
                  {pin.note || "No notes"}
                </p>
              </div>

              <MapPreview lat={pin.lat} long={pin.long} />
            </div>
          ))}
        </div>
      )}

      <PinDetailModal
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        onDelete={
          user?.id === selectedPin?.ownerId ? handleDeletePin : undefined
        }
      />
    </div>
  );
}
