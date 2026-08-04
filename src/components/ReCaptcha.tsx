import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Check } from 'lucide-react';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  siteKey?: string;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void }) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onChange, siteKey, className = '' }) => {
  const envSiteKey = siteKey || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY : undefined);
  const [isChecked, setIsChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    // If a real site key is configured, load official Google reCAPTCHA script
    if (envSiteKey && containerRef.current) {
      const scriptId = 'recaptcha-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      const renderWidget = () => {
        if (window.grecaptcha && containerRef.current && widgetIdRef.current === null) {
          try {
            widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
              sitekey: envSiteKey,
              callback: (token: string) => {
                setIsChecked(true);
                onChange(token);
              },
              'expired-callback': () => {
                setIsChecked(false);
                onChange(null);
              },
            });
          } catch (e) {
            console.warn('Google reCAPTCHA render error, fallback active:', e);
          }
        }
      };

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
        script.async = true;
        script.defer = true;
        window.onRecaptchaLoad = renderWidget;
        document.head.appendChild(script);
      } else if (window.grecaptcha) {
        renderWidget();
      }

      return () => {
        // cleanup if unmounted
      };
    }
  }, [envSiteKey, onChange]);

  // Fallback interactive reCAPTCHA when no active sitekey API is configured
  const handleCheckboxClick = () => {
    if (envSiteKey) return; // handled by Google script iframe
    if (isChecked || isVerifying) return;

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setIsChecked(true);
      const fakeToken = `recaptcha_verified_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      onChange(fakeToken);
    }, 600);
  };

  if (envSiteKey) {
    return (
      <div className={`my-4 flex justify-center ${className}`}>
        <div ref={containerRef} />
      </div>
    );
  }

  return (
    <div className={`my-4 select-none ${className}`}>
      <div className="w-[304px] h-[76px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] shadow-xs px-3 py-2 flex items-center justify-between mx-auto transition-all hover:border-[#c1c1c1]">
        {/* Left Side: Checkbox / Spinner */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={isChecked || isVerifying}
            className={`w-[28px] h-[28px] rounded-[2px] border transition-all flex items-center justify-center cursor-pointer ${
              isChecked
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : isVerifying
                ? 'bg-white border-sky-400'
                : 'bg-white border-[#c1c1c1] hover:border-[#a6a6a6]'
            }`}
            aria-label="Não sou um robô"
          >
            {isVerifying ? (
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            ) : isChecked ? (
              <Check className="w-5 h-5 stroke-[3]" />
            ) : null}
          </button>
          <span className="text-[14px] text-[#222222] font-normal font-sans">
            Não sou um robô
          </span>
        </div>

        {/* Right Side: reCAPTCHA Brand */}
        <div className="flex flex-col items-center justify-center text-center pl-2 border-l border-slate-100">
          <div className="flex items-center space-x-1 text-[#4a90e2]">
            <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
          </div>
          <span className="text-[10px] text-[#555555] font-semibold tracking-tighter -mt-0.5">
            reCAPTCHA
          </span>
          <div className="flex space-x-1 text-[8px] text-[#999999] leading-tight mt-0.5">
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Privacidade
            </a>
            <span>-</span>
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Termos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
