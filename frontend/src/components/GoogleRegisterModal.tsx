import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import ModalWrapper from "./ModalWrapper";

interface GoogleRegisterModalProps {
  preRegisterToken: string;
  googleEmail: string;
  googleName: string;
  onClose: () => void;
  onDone: (token: string, user: any) => void;
}

export default function GoogleRegisterModal({
  preRegisterToken,
  googleEmail,
  googleName,
  onClose,
  onDone,
}: GoogleRegisterModalProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState(googleName);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    if (!username || !realName) {
      setError(t("google.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const data = await api("/auth/google/complete", {
        method: "POST",
        body: JSON.stringify({ preRegisterToken, username, realName }),
      });
      onDone(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper show onClose={onClose}>
      <h2 className="text-white text-xl font-bold mb-1 text-center">
        {t("google.registerTitle")}
      </h2>
      <p className="text-gray-400 text-sm text-center mb-4">{googleEmail}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder={t("register.usernamePlaceholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
          className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          disabled={loading}
        />
        <input
          type="text"
          placeholder={t("register.realNamePlaceholder")}
          value={realName}
          onChange={(e) => setRealName(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          disabled={loading}
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full p-3 rounded-xl bg-purple-600 text-white font-semibold cursor-pointer disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t("google.registering") : t("google.registerButton")}
        </button>
      </form>
    </ModalWrapper>
  );
}
