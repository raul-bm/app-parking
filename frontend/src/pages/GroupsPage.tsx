import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  connectSocket,
  disconnectSocket,
  offGroupsUpdated,
  onGroupsUpdated,
} from "../services/socket";
import CreateGroupModal from "../components/CreateGroupModal";
import ModalWrapper from "../components/ModalWrapper";
import GroupDetailModal from "../components/GroupDetailModal";

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupToShow, setGroupToShow] = useState<any>(null);

  useEffect(() => {
    loadGroups();

    const token = localStorage.getItem("token");
    if (user && token) {
      connectSocket(token);
      onGroupsUpdated(() => {
        loadGroups();
      });
    }

    return () => {
      offGroupsUpdated(loadGroups);
      disconnectSocket();
    };
  }, [user]);

  async function loadGroups() {
    api("/groups")
      .then((data) => {
        if (data !== null) {
          setGroups(data);

          setSelectedGroup((current: any) => {
            if (!current) return current;
            const updated = data.find((g: any) => g.id === current.id);
            return updated || current;
          });

          setGroupToShow((current: any) => {
            if (current) {
              const exists = data.some((g: any) => g.id === current.id);
              if (!exists) return null;
            }
            return current;
          });
        }
      })
      .catch((err) => console.error(err));
  }

  return (
    <div className="p-4 h-full flex flex-col text-white">
      <h1 className="text-white text-2xl font-bold mb-4 text-center mt-4">
        Groups
      </h1>
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full py-3 rounded-xl bg-purple-600 font-semibold hover:bg-purple-500 transition-all cursor-pointer"
      >
        Create group
      </button>
      <div className="flex-1 overflow-y-auto mt-4 space-y-2">
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            You aren't in any groups yet
          </p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              onClick={() => {
                setSelectedGroup(group);
                setGroupToShow(group);
              }}
              className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <p className="text-white font-medium">{group.name}</p>
              <p className="text-gray-400 text-sm">
                {group.members.length} members
              </p>
            </div>
          ))
        )}
      </div>

      <ModalWrapper
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadGroups();
          }}
        />
      </ModalWrapper>

      <ModalWrapper
        show={groupToShow !== null}
        onClose={() => setGroupToShow(null)}
      >
        <GroupDetailModal
          group={selectedGroup}
          onClose={() => setGroupToShow(null)}
          onUpdated={() => {
            loadGroups();
          }}
          currentUserId={user?.id}
        />
      </ModalWrapper>
    </div>
  );
}
