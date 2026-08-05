import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      setSuccess(
        `${t("groupDetail.successAdd1")} @${user.username} ${t("groupDetail.successAdd2")}`,
      );
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
        <h2 className="text-white text-xl font-bold">
          {t("groupDetail.title")} {group.name}
        </h2>
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
            {t("groupDetail.addMember")}{" "}
            <span className="text-xs">({t("groupDetail.ownerOnly")})</span>
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
              placeholder={t("groupDetail.inputPlaceholder")}
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={loadingAdd}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t("groupDetail.addButton")}
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
          {t("groupDetail.members")} ({group.members.length})
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
                    {t("groupDetail.owner")}
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
                      {t("groupDetail.removeMember")}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {currentUserId === group.ownerId ? (
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
          {t("groupDetail.deleteGroup")}
        </button>
      ) : (
        <button
          onClick={async () => {
            try {
              await api(`/groups/${group.id}/members/${currentUserId}`, {
                method: "DELETE",
              });
              onUpdated();
              onClose();
            } catch (err: any) {
              console.error(err);
            }
          }}
          className="w-full mt-6 py-2 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          {t("groupDetail.leaveGroup")}
        </button>
      )}
    </>
  );
}
