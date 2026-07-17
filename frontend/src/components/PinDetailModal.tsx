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
}

export default function PinDetailModal({ pin, onClose }: PinDetailModalProps) {
  if (!pin) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-white text-xl font-bold">Pin Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
          >
            X
          </button>
        </div>
        <div className="space-y-3 text-gray-300">
          <div>
            <span className="text-gray-500 text-sm">Created by</span>
            <p className="text-white font-medium">
              {pin.owner?.realName || "Unknown"}
            </p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Latitude</span>
            <p className="text-white">{pin.lat}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Longitude</span>
            <p className="text-white">{pin.long}</p>
          </div>
          {pin.note && (
            <div>
              <span className="text-gray-500 text-sm">Note</span>
              <p className="text-white">{pin.note}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500 text-sm">Created at</span>
            <p className="text-white">
              {new Date(pin.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
