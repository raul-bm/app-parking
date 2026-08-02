import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

export default function RegisterPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, username, realName }),
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-5 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-8">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">
          {t("register.title")}
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t("register.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          />
          {!emailRegex.test(email) && (
            <p className="text-red-400 text-xs mt-1 text-center">
              {t("register.invalidEmailFormat")}
            </p>
          )}
          <input
            type="text"
            placeholder={t("register.usernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          />
          <input
            type="text"
            placeholder={t("register.realNamePlaceholder")}
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          />
          <input
            type="password"
            placeholder={t("register.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className={`w-full p-3 rounded-xl  font-semibold cursor-pointer ${email === "" || !emailRegex.test(email) ? "bg-purple-900 text-gray-500" : "bg-purple-600 text-white"}`}
            disabled={email === "" || !emailRegex.test(email) ? true : false}
          >
            {t("register.registerButton")}
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-4">
          {t("register.alreadyHaveAccountMessage")}{" "}
          <Link to="/login" className="text-purple-400 underline">
            {t("register.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
