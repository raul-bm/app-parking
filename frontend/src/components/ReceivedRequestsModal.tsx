import { useState } from "react";
import { api } from "../api/client";

interface ReceivedRequestsModalProps {
  requests: Array<{
    id: number;
    requester: {
      id: number;
      username: string;
      realName: string;
    };
  }>;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ReceivedRequestsModal({
  requests,
  onClose,
  onUpdated,
}: ReceivedRequestsModalProps) {
  const [disabledId, setDisabledId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [errorId, setErrorId] = useState<number | null>(null);

  async function handleAcceptRequest(requestId: number) {
    setDisabledId(requestId);
    setErrorId(null);
    setError("");

    try {
      await api(`/friendships/${requestId}/accept`, {
        method: "PATCH",
      });
      onUpdated();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setErrorId(requestId);
    } finally {
      setDisabledId(null);
    }
  }

  async function handleCancelRequest(requestId: number) {
    setDisabledId(requestId);
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
      setDisabledId(null);
    }
  }

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-white text-xl font-bold">Received Requests</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
        >
          X
        </button>
      </div>
      {requests.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No requests</p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-700 rounded-xl p-4 flex-1 items-center justify-between gap-4 border border-gray-600"
            >
              <div className="flex gap-10">
                <p className="text-white font-medium">
                  @{request.requester.username}
                </p>
                <button
                  onClick={() => handleCancelRequest(request.id)}
                  className="py-1 px-3 rounded-xl bg-red-700 text-white font-semibold hover:bg-red-600 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  disabled={request.id === disabledId}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="py-1 px-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-600 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  disabled={request.id === disabledId}
                >
                  Accept
                </button>
              </div>
              {error && errorId === request.id && (
                <p className="text-red-400 text-center mt-5">{error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
