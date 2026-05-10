import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

export const isRecaptchaEnabled = () => Boolean(SITE_KEY);

export interface RecaptchaWidgetHandle {
  reset: () => void;
  executeAsync: () => Promise<string | null>;
}

const RecaptchaWidget = forwardRef<RecaptchaWidgetHandle>((_, ref) => {
  const innerRef = useRef<ReCAPTCHA>(null);

  useImperativeHandle(ref, () => ({
    reset: () => innerRef.current?.reset(),
    executeAsync: async () => {
      const token = await innerRef.current?.executeAsync();
      return token ?? null;
    },
  }));

  if (!SITE_KEY) return null;

  return (
    <ReCAPTCHA
      ref={innerRef}
      sitekey={SITE_KEY}
      size="invisible"
      badge="bottomright"
    />
  );
});

RecaptchaWidget.displayName = 'RecaptchaWidget';

export default RecaptchaWidget;
