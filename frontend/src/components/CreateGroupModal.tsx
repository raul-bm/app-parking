import { useState } from "react";
import { api } from "../api/client";

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateGroupModal({
  onClose,
  onCreated,
}: CreateGroupModalProps) {
  const [nameGroup, setNameGroup] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateGroup() {
    if (nameGroup === "") return;

    setLoading(true);
    setError("");

    try {
      await api("/groups", {
        method: "POST",
        body: JSON.stringify({ name: nameGroup }),
      });

      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-white text-xl font-bold">Create group</h2>
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
          handleCreateGroup();
        }}
        className="flex gap-2"
      >
        <input
          value={nameGroup}
          onChange={(e) => setNameGroup(e.target.value)}
          placeholder="Group name"
          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors cursor-pointer"
          disabled={loading}
        >
          Create
        </button>
      </form>
      {error && <p className="text-red-400 text-center mt-5">{error}</p>}
    </>
  );
}
