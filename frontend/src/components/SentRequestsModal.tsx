import { useState } from "react";
import { api } from "../api/client";

interface SentRequestsModalProps {
  requests: Array<{
    id: number;
    addressee: {
      id: number;
      username: string;
      realName: string;
    };
  }>;
  onClose: () => void;
  onUpdated: () => void;
}

export default function SentRequestsModal({
  requests,
  onClose,
  onUpdated,
}: SentRequestsModalProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [errorId, setErrorId] = useState<number | null>(null);

  async function handleCancelRequest(requestId: number) {
    setCancellingId(requestId);
    setErrorId(null);
    setError("");

    try {
      await api(`/friendships/${requestId}/reject`, {
        method: "PATCH",
      });
      onUpdated();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setErrorId(requestId);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-white text-xl font-bold">Sent Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
          >
            X
          </button>
        </div>
        {requests.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No sent requests</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-700 rounded-xl p-4 flex-1 items-center justify-between gap-4 border border-gray-600"
              >
                <div className="flex justify-between">
                  <p className="text-white font-medium">
                    @{request.addressee.username}
                  </p>
                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    className="py-1 px-2 rounded-xl bg-red-700 text-white font-semibold hover:bg-red-600 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    disabled={request.id === cancellingId}
                  >
                    Cancel
                  </button>
                </div>
                {error && errorId === request.id && (
                  <p className="text-red-400 text-center mt-5">{error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
