import { useEffect, useState } from "react";
import { api } from "../api/client";

interface SharePinModalProps {
  pinId: number;
  onClose: () => void;
}

export default function SharePinModal({ pinId, onClose }: SharePinModalProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");
  const [friends, setFriends] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [sharedWithUserIds, setSharedWithUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [sharedWithGroupIds, setSharedWithGroupIds] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [friendsData, groupsData, pinsData] = await Promise.all([
          api("/friendships").catch(() => null),
          api("/groups").catch(() => null),
          api(`/pins/${pinId}`).catch(() => null),
        ]);
        if (friendsData !== null) setFriends(friendsData);
        if (groupsData !== null) setGroups(groupsData);

        setSharedWithUserIds(
          new Set<number>(
            (pinsData?.sharedWithUsers || []).map((s: any) => s.userId),
          ),
        );

        setSharedWithGroupIds(
          new Set<number>(
            (pinsData?.sharedWithGroups || []).map((s: any) => s.groupId),
          ),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [pinId]);

  async function handleToggleUserShare(userId: number) {
    const isShared = sharedWithUserIds.has(userId);

    try {
      if (isShared) {
        await api(`/pins/${pinId}/share/user/${userId}`, { method: "DELETE" });
        setSharedWithUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await api(`/pins/${pinId}/share/user`, {
          method: "POST",
          body: JSON.stringify({ userId: userId }),
        });
        setSharedWithUserIds((prev) => new Set(prev).add(userId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleGroupShare(groupId: number) {
    const isShared = sharedWithGroupIds.has(groupId);

    try {
      if (isShared) {
        await api(`/pins/${pinId}/share/group/${groupId}`, {
          method: "DELETE",
        });
        setSharedWithGroupIds((prev) => {
          const next = new Set(prev);
          next.delete(groupId);
          return next;
        });
      } else {
        await api(`/pins/${pinId}/share/group`, {
          method: "POST",
          body: JSON.stringify({ groupId }),
        });
        setSharedWithGroupIds((prev) => new Set(prev).add(groupId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-white text-xl font-bold">Share pin</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
        >
          X
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 py-2 rounded-xl font-medium transition-all cursor-pointer ${activeTab === "friends" ? "bg-purple-600 text-white" : "bg-purple-800 text-gray-500 hover:bg-purple-700"}`}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 py-2 rounded-xl font-medium transition-all cursor-pointer ${activeTab === "groups" ? "bg-purple-600 text-white" : "bg-purple-800 text-gray-500 hover:bg-purple-700"}`}
        >
          Groups
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : activeTab === "friends" ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {friends.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No friends yet</p>
          ) : (
            friends.map((friend: any) => {
              const isShared = sharedWithUserIds.has(friend.id);
              return (
                <div
                  key={friend.friendshipId}
                  className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      @{friend.username}
                    </p>
                    <p className="text-gray-400 text-xs">{friend.realName}</p>
                  </div>
                  <button
                    onClick={() => handleToggleUserShare(friend.id)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${isShared ? "bg-red-700 text-white hover:bg-red-600" : "bg-purple-600 text-white hover:bg-purple-500"}`}
                  >
                    {isShared ? "Stop sharing" : "Share"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {groups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No groups yet</p>
          ) : (
            groups.map((group: any) => {
              const isShared = sharedWithGroupIds.has(group.id);
              return (
                <div
                  key={group.id}
                  className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {group.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {group.members?.length} members
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleGroupShare(group.id)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isShared
                        ? "bg-red-700 text-white hover:bg-red-600"
                        : "bg-purple-600 text-white hover:bg-purple-500"
                    }`}
                  >
                    {isShared ? "Stop sharing" : "Share"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
