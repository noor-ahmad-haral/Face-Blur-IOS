import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en, { type Translations } from './locales/en';
import es from './locales/es';
import pt from './locales/pt';
import fr from './locales/fr';
import de from './locales/de';
import ru from './locales/ru';
import hi from './locales/hi';
import id from './locales/id';
import zh from './locales/zh';
import ja from './locales/ja';
import ar from './locales/ar';
import ur from './locales/ur';

// Labels are written in each language's own script, which is what a language
// picker should show — someone looking for their language cannot necessarily
// read the current one.
export const LANGUAGES = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'es', label: 'Español', rtl: false },
  { code: 'pt', label: 'Português', rtl: false },
  { code: 'fr', label: 'Français', rtl: false },
  { code: 'de', label: 'Deutsch', rtl: false },
  { code: 'ru', label: 'Русский', rtl: false },
  { code: 'hi', label: 'हिन्दी', rtl: false },
  { code: 'id', label: 'Bahasa Indonesia', rtl: false },
  { code: 'zh', label: '简体中文', rtl: false },
  { code: 'ja', label: '日本語', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'ur', label: 'اردو', rtl: true },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];

const TABLES: Record<LangCode, Translations> = { en, es, pt, fr, de, ru, hi, id, zh, ja, ar, ur };

const LANG_KEY = 'blurface.language.v1';

// Read the system language without expo-localization, which would be another
// native module and so another dev-client rebuild. React Native already
// exposes the locale, and Hermes ships Intl as a backstop.
function deviceLanguage(): LangCode {
  let tag = '';
  try {
    if (Platform.OS === 'android') {
      tag = NativeModules?.I18nManager?.localeIdentifier ?? '';
    } else {
      const s = NativeModules?.SettingsManager?.settings;
      tag = s?.AppleLocale ?? s?.AppleLanguages?.[0] ?? '';
    }
    if (!tag && typeof Intl !== 'undefined') {
      tag = Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    }
  } catch {
    // Fall through to English.
  }
  // "pt_BR" / "zh-Hans-CN" both reduce to the base language we ship.
  const base = tag.toLowerCase().replace(/_/g, '-').split('-')[0];
  const match = LANGUAGES.find((l) => l.code === base);
  return match ? match.code : 'en';
}

type Ctx = {
  t: Translations;
  lang: LangCode;
  isRTL: boolean;
  setLanguage: (code: LangCode) => void;
};

const I18nContext = createContext<Ctx>({
  t: en,
  lang: 'en',
  isRTL: false,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LangCode | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved && saved in TABLES) {
          setLang(saved as LangCode);
          return;
        }
      } catch {
        // Ignored — fall back to the system language.
      }
      setLang(deviceLanguage());
    })();
  }, []);

  const setLanguage = useCallback((code: LangCode) => {
    setLang(code);
    AsyncStorage.setItem(LANG_KEY, code).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const active: LangCode = lang ?? 'en';
    return {
      t: TABLES[active],
      lang: active,
      isRTL: LANGUAGES.find((l) => l.code === active)?.rtl ?? false,
      setLanguage,
    };
  }, [lang, setLanguage]);

  // Hold rendering until the stored choice resolves, so the UI never flashes
  // one language and then swaps to another.
  if (lang === null) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
