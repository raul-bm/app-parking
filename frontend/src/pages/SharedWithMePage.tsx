import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import MapPreview from "../components/MapPreview";
import ModalWrapper from "../components/ModalWrapper";
import PinDetailModal from "../components/PinDetailModal";
import {
  connectSocket,
  disconnectSocket,
  offPinsChanged,
  onPinsChanged,
} from "../services/socket";
import { formatDate } from "../utils/formatDate";
import { useTranslation } from "react-i18next";

function getLatestShareDate(pin: any): string {
  let latest = "";

  for (const s of pin.sharedWithUsers || []) {
    if (s.createdAt && s.createdAt > latest) latest = s.createdAt;
  }
  for (const s of pin.sharedWithGroups || []) {
    if (s.createdAt && s.createdAt > latest) latest = s.createdAt;
  }

  return latest || pin.createdAt;
}

export default function SharedWithMePage() {
  const { t } = useTranslation();

  const { user } = useAuth();
  const [pins, setPins] = useState<any[]>([]);
  const [selectedPin, setSelectedPin] = useState<any>(null);

  useEffect(() => {
    loadSharedPins();

    const token = localStorage.getItem("token");
    if (user && token) {
      connectSocket(token);
      onPinsChanged(loadSharedPins);
    }

    return () => {
      offPinsChanged(loadSharedPins);
      disconnectSocket();
    };
  }, [user]);

  async function loadSharedPins() {
    try {
      const data = await api("/pins/shared-with-me");

      const sorted = (data || []).sort((a: any, b: any) => {
        const dateA = getLatestShareDate(a);
        const dateB = getLatestShareDate(b);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setPins(sorted || []);

      setSelectedPin((current: any) => {
        if (!current) return current;
        const updated = (data || []).find((p: any) => p.id === current.id);
        return updated || null;
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="h-full bg-gray-900 p-4 overflow-y-auto">
      <h1 className="text-white text-2xl font-bold mb-4 text-center mt-4">
        {t("sharedWithMe.title")}
      </h1>

      {pins.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          {t("sharedWithMe.noPins")}
        </p>
      ) : (
        <div className="space-y-3">
          {pins.map((pin) => {
            const sharedDate = getLatestShareDate(pin);
            return (
              <div
                key={pin.id}
                onClick={() => setSelectedPin(pin)}
                className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer
                    hover:bg-gray-750 transition-colors border border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs">
                    {t("sharedWithMe.sharedAt")} {formatDate(sharedDate)}
                  </p>
                  <p className="text-white mt-1 truncate">
                    {pin.note || (
                      <span className="text-gray-500 italic">
                        {t("pinDetail.noNotes")}
                      </span>
                    )}
                  </p>
                  <p className="text-purple-400 text-xs mt-1">
                    {t("sharedWithMe.sharedBy")}{" "}
                    {pin.owner?.realName || t("pinDetail.unknown")}
                  </p>
                  {pin.sharedWithGroups?.length > 0 && (
                    <p className="text-indigo-400 text-xs">
                      {t("sharedWithMe.throughGroup")}{" "}
                      {pin.sharedWithGroups
                        .map((s: any) => s.group.name)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <MapPreview lat={pin.lat} long={pin.long} />
              </div>
            );
          })}
        </div>
      )}
      <ModalWrapper
        show={selectedPin !== null}
        onClose={() => setSelectedPin(null)}
      >
        <PinDetailModal
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onUpdate={(pinId, updatedPin) => {
            setPins((prev) =>
              prev.map((p) => (p.id === pinId ? updatedPin : p)),
            );
          }}
        />
      </ModalWrapper>
    </div>
  );
}
