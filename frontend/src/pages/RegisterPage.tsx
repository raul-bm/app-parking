import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";
import GoogleRegisterModal from "../components/GoogleRegisterModal";

export default function RegisterPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const [googleProfile, setGoogleProfile] = useState<{
    preRegisterToken: string;
    googleEmail: string;
    googleName: string;
  } | null>(null);

  async function handleGoogleToken(idToken: string) {
    setError("");

    try {
      const data = await api("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });

      if (data.requiresProfile) {
        setGoogleProfile(data);
      } else {
        login(data.token, data.user);
        navigate("/map");
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("register.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword
                  ? t("register.hidePassword")
                  : t("register.showPassword")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l10.5 10.5a.75.75 0 1 0 1.06-1.06l-1.322-1.323a7.012 7.012 0 0 0 2.16-3.11.87.87 0 0 0 0-.567A7.003 7.003 0 0 0 4.82 3.76l-1.54-1.54Zm3.196 3.195 1.135 1.136A1.502 1.502 0 0 1 9.45 8.389l1.136 1.135a3 3 0 0 0-4.109-4.109Z"
                    clipRule="evenodd"
                  />
                  <path d="m7.812 10.994 1.816 1.816A7.003 7.003 0 0 1 1.38 8.28a.87.87 0 0 1 0-.566 6.985 6.985 0 0 1 1.113-2.039l2.513 2.513a3 3 0 0 0 2.806 2.806Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-4"
                >
                  <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  <path
                    fillRule="evenodd"
                    d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className={`w-full p-3 rounded-xl  font-semibold cursor-pointer ${email === "" || !emailRegex.test(email) ? "bg-purple-900 text-gray-500" : "bg-purple-600 text-white"}`}
            disabled={email === "" || !emailRegex.test(email) ? true : false}
          >
            {t("register.registerButton")}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-gray-600 flex-1" />
          <span className="text-gray-400 text-sm">{t("google.or")}</span>
          <div className="h-px bg-gray-600 flex-1" />
        </div>
        <GoogleButton onToken={handleGoogleToken} />

        {googleProfile && (
          <GoogleRegisterModal
            preRegisterToken={googleProfile.preRegisterToken}
            googleEmail={googleProfile.googleEmail}
            googleName={googleProfile.googleName}
            onClose={() => setGoogleProfile(null)}
            onDone={(token, user) => {
              login(token, user);
              navigate("/map");
            }}
          />
        )}

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
