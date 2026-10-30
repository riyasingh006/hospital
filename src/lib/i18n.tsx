"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "en" | "hi";

type Dict = Record<string, string>;

const en: Dict = {
  "brand.sub": "AI-Powered Healthcare Navigation Platform",
  "nav.home": "Home",
  "nav.findHospital": "Find Hospital",
  "nav.aiAssistant": "AI Assistant",
  "nav.doctors": "Doctors",
  "nav.services": "Healthcare Services",
  "nav.emergency": "Emergency",
  "nav.about": "About",
  "nav.login": "Login",
  "nav.signup": "Sign Up",
  "nav.dashboard": "My Dashboard",
  "nav.logout": "Logout",
  "util.skip": "Skip to Content",
  "util.help": "Help",
  "util.accessibility": "Accessibility",
  "util.notifications": "Notifications",
  "notice.text":
    "Important: Hospital availability information depends on the latest update provided by the healthcare facility.",
  "hero.title": "Find the Right Healthcare, When It Matters Most.",
  "hero.body":
    "जीवन Sahay helps you discover and navigate to suitable healthcare facilities based on your medical requirements, hospital capabilities, availability, and location.",
  "hero.cta.primary": "Find Suitable Hospital",
  "hero.cta.emergency": "Emergency Assistance",
  "hero.cta.askAi": "Ask जीवन AI",
  "emergency.heading": "Need Urgent Medical Assistance?",
  "emergency.body":
    "Find nearby healthcare facilities equipped to handle your requirement.",
  "emergency.cta": "FIND EMERGENCY CARE",
  "emergency.helpline": "Emergency Helpline",
  "search.heading": "How can we help you today?",
  "search.placeholder": "Describe your healthcare requirement...",
  "search.voice": "Voice Search",
  "search.askAi": "Ask जीवन AI",
  "services.heading": "Quick Services",
  "how.heading": "How जीवन Sahay Works",
  "footer.rights": "© 2026 जीवन Sahay. All rights reserved.",
  "footer.disclaimer":
    "This platform is designed for healthcare navigation and decision support and does not replace professional medical advice.",
  "common.viewDetails": "View Details",
  "common.navigate": "Navigate",
  "common.call": "Call",
  "common.save": "Save",
  "common.saved": "Saved",
  "common.compare": "Compare",
  "common.lastUpdated": "Last updated",
  "common.available": "Available",
  "common.limited": "Limited",
  "common.unavailable": "Unavailable",
};

const hi: Dict = {
  "brand.sub": "एआई आधारित स्वास्थ्य नेविगेशन प्लेटफॉर्म",
  "nav.home": "होम",
  "nav.findHospital": "अस्पताल खोजें",
  "nav.aiAssistant": "एआई सहायक",
  "nav.doctors": "डॉक्टर",
  "nav.services": "स्वास्थ्य सेवाएँ",
  "nav.emergency": "आपातकाल",
  "nav.about": "परिचय",
  "nav.login": "लॉगिन",
  "nav.signup": "साइन अप",
  "nav.dashboard": "मेरा डैशबोर्ड",
  "nav.logout": "लॉगआउट",
  "util.skip": "सामग्री पर जाएँ",
  "util.help": "सहायता",
  "util.accessibility": "सुगम्यता",
  "util.notifications": "सूचनाएँ",
  "notice.text":
    "महत्वपूर्ण: अस्पताल की उपलब्धता की जानकारी स्वास्थ्य सुविधा द्वारा दी गई नवीनतम अद्यतन पर आधारित है।",
  "hero.title": "सही स्वास्थ्य सेवा, जब सबसे ज़रूरी हो।",
  "hero.body":
    "जीवन Sahay आपकी चिकित्सा आवश्यकता, अस्पताल की क्षमता, उपलब्धता और स्थान के आधार पर उपयुक्त स्वास्थ्य सुविधाएँ खोजने में सहायता करता है।",
  "hero.cta.primary": "उपयुक्त अस्पताल खोजें",
  "hero.cta.emergency": "आपातकालीन सहायता",
  "hero.cta.askAi": "जीवन AI से पूछें",
  "emergency.heading": "तत्काल चिकित्सा सहायता चाहिए?",
  "emergency.body":
    "अपनी आवश्यकता के अनुसार सुसज्जित नज़दीकी स्वास्थ्य सुविधाएँ खोजें।",
  "emergency.cta": "आपातकालीन देखभाल खोजें",
  "emergency.helpline": "आपातकालीन हेल्पलाइन",
  "search.heading": "आज हम आपकी क्या सहायता कर सकते हैं?",
  "search.placeholder": "अपनी स्वास्थ्य आवश्यकता बताएं...",
  "search.voice": "वॉइस खोज",
  "search.askAi": "जीवन AI से पूछें",
  "services.heading": "त्वरित सेवाएँ",
  "how.heading": "जीवन Sahay कैसे काम करता है",
  "footer.rights": "© 2026 जीवन Sahay। सर्वाधिकार सुरक्षित।",
  "footer.disclaimer":
    "यह प्लेटफ़ॉर्म स्वास्थ्य नेविगेशन और निर्णय सहायता हेतु है और योग्य चिकित्सक की सलाह का विकल्प नहीं है।",
  "common.viewDetails": "विवरण देखें",
  "common.navigate": "रास्ता देखें",
  "common.call": "कॉल करें",
  "common.save": "सहेजें",
  "common.saved": "सहेजा गया",
  "common.compare": "तुलना करें",
  "common.lastUpdated": "अंतिम अद्यतन",
  "common.available": "उपलब्ध",
  "common.limited": "सीमित",
  "common.unavailable": "अनुपलब्ध",
};

const dictionaries: Record<Language, Dict> = { en, hi };

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key] ?? key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("js_lang");
    if (stored === "hi" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem("js_lang", next);
      document.documentElement.lang = next === "hi" ? "hi" : "en";
    } catch {
      /* storage unavailable */
    }
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
