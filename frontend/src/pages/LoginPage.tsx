import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";
import GoogleButton from "../components/GoogleButton";
import GoogleRegisterModal from "../components/GoogleRegisterModal";

export default function LoginPage() {
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      login(data.token, data.user);
      navigate("/map");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-5 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-8">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">
          {t("login.title")}
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("login.inputPlaceholder")}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          />
          <input
            type="password"
            placeholder={t("login.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 outline-none"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full p-3 rounded-xl bg-purple-600 text-white font-semibold cursor-pointer"
          >
            {t("login.loginButton")}
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
          {t("login.dontHaveAccountMessage")}{" "}
          <Link to="/register" className="text-purple-400 underline">
            {t("login.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
