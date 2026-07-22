import { useEffect, useState, type ReactNode } from "react";

interface ModalWrapperProps {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalWrapper({
  show,
  onClose,
  children,
}: ModalWrapperProps) {
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      setTimeout(() => setRender(false), 200);
    }
  }, [show]);

  if (!render) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center transition-all duration-200 ${visible ? "bg-black/50" : "bg-black/0"}`}
      onClick={() => {
        if (visible) {
          setVisible(false);
          setTimeout(onClose, 200);
        }
      }}
    >
      <div
        className={`bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-700 max-h-[85vh] overflow-y-auto transition-all duration-200 ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
