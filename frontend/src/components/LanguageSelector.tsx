import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const languages = [
  { code: "es", label: "nav.spanish" },
  { code: "en", label: "nav.english" },
  { code: "val", label: "nav.valencian" },
];

export default function LanguageSelector() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = i18n.language.startsWith("es")
    ? "es"
    : i18n.language.startsWith("val")
      ? "val"
      : "en";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
        title={t("nav.languages")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          {languages.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${isActive ? "bg-gray-700 text-purple-400" : "text-gray-300 hover:bg-gray-700"}`}
              >
                <span>{t(lang.label)}</span>
                {isActive && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-5 text-purple-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
