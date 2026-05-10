import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { applyAccent, readStoredAccent, STORAGE_KEY } from './accent';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeAccent = useAuthStore(s => s.user?.themeAccent ?? null);

  useEffect(() => {
    applyAccent(readStoredAccent());
  }, []);

  useEffect(() => {
    if (themeAccent) {
      localStorage.setItem(STORAGE_KEY, themeAccent);
      applyAccent(themeAccent);
    }
  }, [themeAccent]);

  return <>{children}</>;
}
