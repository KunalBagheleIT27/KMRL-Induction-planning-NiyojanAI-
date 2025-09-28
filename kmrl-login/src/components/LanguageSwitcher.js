import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="lang-switcher" role="navigation" aria-label="Language switcher">
      <button className="lang-btn" onClick={() => changeLanguage('en')}>English</button>
      <button className="lang-btn" onClick={() => changeLanguage('ml')}>മലയാളം</button>
    </div>
  );
}
