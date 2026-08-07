import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleButtonProps {
  onToken: (idToken: string) => void;
}

export default function GoogleButton({ onToken }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!clientId) return;

    if (window.google) {
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, [clientId]);

  useEffect(() => {
    if (!ready || !clientId || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response?.credential) onTokenRef.current(response.credential);
      },
    });

    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 336,
    });
  }, [ready, clientId]);

  if (!clientId) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}
