import { useState } from "react";
import { api } from "../api/client";

interface AddFriendModalProps {
  onClose: () => void;
  onFriendAdded: () => void;
}

export default function AddFriendModal({
  onClose,
  onFriendAdded,
}: AddFriendModalProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddFriend() {
    if (query === "") return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await api(`/users/search?query=${query}`);
      setQuery("");
      const friendRequest = await api(`/friendships/request/${user.id}`, {
        method: "POST",
      });
      setSuccess(
        `The user "${friendRequest.addressee.username}" added successfully`,
      );
      onFriendAdded();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
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
          <h2 className="text-white text-xl font-bold">Add friend</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
          >
            X
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddFriend();
          }}
          className="flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Email or username"
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors cursor-pointer"
            disabled={loading}
          >
            Add
          </button>
        </form>
        {error && <p className="text-red-400 text-center mt-5">{error}</p>}
        {success && (
          <p className="text-green-400 text-center mt-5">{success}</p>
        )}
      </div>
    </div>
  );
}
