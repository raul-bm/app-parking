import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import AddFriendModal from "../components/AddFriendModal";

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  //const [sentRequests, setSentRequests] = useState<any[]>([]);
  //const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  //const [showSentModal, setShowSentModal] = useState(false);
  //const [showReceivedModal, setShowReceivedModal] = useState(false);

  useEffect(() => {
    loadAll();
  }, [user]);

  async function loadAll() {
    try {
      /*const [friendsData, sentData, receivedData] = await Promise.all([
        api("/friendships"),
        api("/friendships/sent"),
        api("/friendships/pending"),
      ]);*/
      const [friendsData] = await Promise.all([api("/friendships")]);
      setFriends(friendsData);
      //setSentRequests(sentData);
      //setReceivedRequests(receivedData);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-4 h-full flex flex-col text-white">
      <h1 className="text-white text-2xl font-bold mb-4 text-center mt-4">
        Friends
      </h1>
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full py-3 rounded-xl bg-purple-600 font-semibold hover:bg-purple-500 transition-all cursor-pointer"
      >
        Add friend
      </button>
      {/*
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => setShowSentModal(true)}
          className="flex-1 py-2 rounded-xl bg-indigo-600 font-medium hover:bg-indigo-500 transition-all cursor-pointer"
        >
          Sent {sentRequests.length > 0 ? `(${sentRequests.length})` : ""}
        </button>
        <button
          onClick={() => setShowReceivedModal(true)}
          className="flex-1 py-2 rounded-xl bg-indigo-600 font-medium hover:bg-indigo-500 transition-all cursor-pointer"
        >
          Received{" "}
          {receivedRequests.length > 0 ? `(${receivedRequests.length})` : ""}
        </button>
      </div>
      */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-2">
        {friends.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No friends yet</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.friendshipId}
              className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-white font-medium">{friend.username}</p>
                <p className="text-gray-400 text-sm">{friend.realName}</p>
              </div>
              <button
                onClick={async () => {
                  await api(`/friendships/${friend.friendshipId}`, {
                    method: "DELETE",
                  });
                  loadAll();
                }}
                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Remove friend"
              >
                X
              </button>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddFriendModal
          onClose={() => setShowAddModal(false)}
          onFriendAdded={() => {
            loadAll();
          }}
        />
      )}
      {/*
      {showSentModal && (
        <SentRequestsModal
          requests={sentRequests}
          onClose={() => setShowSentModal(false)}
          onFriendAdded={() => {
            loadAll();
          }}
        />
      )}
      {showSentModal && (
        <ReceivedRequestsModal
          requests={receivedRequests}
          onClose={() => setShowReceivedModal(false)}
          onFriendAdded={() => {
            loadAll();
          }}
        />
      )}
      */}
    </div>
  );
}
