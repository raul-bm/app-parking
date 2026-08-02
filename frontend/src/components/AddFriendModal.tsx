import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";

interface AddFriendModalProps {
  onClose: () => void;
  onFriendAdded: () => void;
}

export default function AddFriendModal({
  onClose,
  onFriendAdded,
}: AddFriendModalProps) {
  const { t } = useTranslation();

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
        `${t("addFriend.success1")} "${friendRequest.addressee.username}" ${t("addFriend.success2")}`,
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
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-white text-xl font-bold">{t("addFriend.title")}</h2>
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
          placeholder={t("addFriend.inputPlaceholder")}
          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors cursor-pointer"
          disabled={loading}
        >
          {t("addFriend.addButton")}
        </button>
      </form>
      {error && <p className="text-red-400 text-center mt-5">{error}</p>}
      {success && <p className="text-green-400 text-center mt-5">{success}</p>}
    </>
  );
}
