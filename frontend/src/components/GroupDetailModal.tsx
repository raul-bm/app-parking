import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface GroupDetailModalProps {
  group: any;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: number | undefined;
}

export default function GroupDetailModal({
  group,
  onClose,
  onUpdated,
  currentUserId,
}: GroupDetailModalProps) {
  const { user } = useAuth();

  const [searchUserAdd, setSearchUserAdd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);

  async function handleAddMember() {
    if (searchUserAdd === "") return;

    setLoadingAdd(true);
    setError("");
    setSuccess("");

    try {
      const user = await api(`/users/search?query=${searchUserAdd}`);
      setSearchUserAdd("");
      await api(`/groups/${group.id}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });
      setSuccess(`Added the user @${user.username} successfully!`);
      onUpdated();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingAdd(false);
    }
  }

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-white text-xl font-bold">Group: {group.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
        >
          X
        </button>
      </div>
      {user?.id === group.ownerId && (
        <div className="mb-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">
            Add member <span className="text-xs">(owner only)</span>
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddMember();
            }}
            className="flex gap-2"
          >
            <input
              value={searchUserAdd}
              onChange={(e) => setSearchUserAdd(e.target.value)}
              placeholder="Username or Email"
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={loadingAdd}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Add
            </button>
          </form>
          {error && <p className="text-red-400 text-center mt-5">{error}</p>}
          {success && (
            <p className="text-green-400 text-center mt-5">{success}</p>
          )}
        </div>
      )}
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-2">
          Members ({group.members.length})
        </h3>
        <div className="space-y-2">
          {group.members.map((member: any) => (
            <div
              key={member.user.id}
              className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  @{member.user.username}
                </p>
                <p className="text-gray-400 text-xs">{member.user.realName}</p>
              </div>
              <div className="flex items-center gap-2">
                {member.user.id === group.ownerId && (
                  <span className="text-xs text-purple-400 font-medium">
                    Owner
                  </span>
                )}
                {currentUserId === group.ownerId &&
                  member.user.id !== group.ownerId && (
                    <button
                      onClick={async () => {
                        try {
                          await api(
                            `/groups/${group.id}/members/${member.user.id}`,
                            {
                              method: "DELETE",
                            },
                          );
                          onUpdated();
                        } catch (err: any) {
                          console.error(err);
                        }
                      }}
                      className="py-1 px-2 rounded-xl bg-red-800 text-white font-semibold hover:bg-red-600 active:scale-[0.98] transition-all duration-200 cursor-pointer text-xs"
                      title="Remove member"
                    >
                      Remove member
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {currentUserId === group.ownerId && (
        <button
          onClick={async () => {
            try {
              await api(`/groups/${group.id}`, { method: "DELETE" });
              onUpdated();
              onClose();
            } catch (err: any) {
              console.error(err);
            }
          }}
          className="w-full mt-6 py-2 rounded-xl bg-red-700 text-white font-semibold hover:bg-red-600 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          Delete group
        </button>
      )}
    </>
  );
}
