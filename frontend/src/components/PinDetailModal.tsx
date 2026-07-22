import { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { api } from "../api/client";

interface PinDetailModalProps {
  pin: {
    id: number;
    lat: number;
    long: number;
    note: string | null;
    createdAt: string;
    owner: { realName: string } | null;
  } | null;
  onClose: () => void;
  onDelete?: (pinId: number) => void;
  onUpdate?: (pinId: number, updatedPin: any) => void;
}

export default function PinDetailModal({
  pin,
  onClose,
  onDelete,
  onUpdate,
}: PinDetailModalProps) {
  if (!pin) return null;

  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState(pin.note || "");
  const [currentNote, setCurrentNote] = useState(pin.note);
  const [saving, setSaving] = useState(false);

  async function handleSaveNote() {
    if (!pin) return;

    setSaving(true);
    try {
      const updated = await api(`/pins/${pin.id}`, {
        method: "PATCH",
        body: JSON.stringify({ note: editNote }),
      });
      setCurrentNote(editNote);
      onUpdate?.(pin.id, updated);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update note", err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditNote(currentNote || "");
    setEditing(false);
  }

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-white text-xl font-bold">Pin Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
        >
          X
        </button>
      </div>

      <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-gray-600">
        <MapContainer
          center={[pin.lat, pin.long]}
          zoom={16}
          className="h-full w-full"
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[pin.lat, pin.long]} />
        </MapContainer>
      </div>

      <div className="space-y-3 text-gray-300">
        <div>
          <span className="text-gray-500 text-sm">Created by</span>
          <p className="text-white font-medium">
            {pin.owner?.realName || "Unknown"}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Note</span>
            {!editing && (
              <button
                onClick={() => {
                  setEditNote(currentNote || "");
                  setEditing(true);
                }}
                className="text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
                title="Edit note"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
            )}
          </div>
          {editing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={3}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-
          purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                placeholder="Add a note..."
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="x-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-700 rounded-lg hover:bg-gray-600
            transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500
            transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white mt-1">
              {currentNote || (
                <span className="text-gray-500 italic">No notes</span>
              )}
            </p>
          )}
        </div>
        <div>
          <span className="text-gray-500 text-sm">Created at</span>
          <p className="text-white">
            {new Date(pin.createdAt).toLocaleString()}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => {
              onDelete(pin.id);
              onClose();
            }}
            className="w-full mt-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Delete pin
          </button>
        )}
      </div>
    </>
  );
}
