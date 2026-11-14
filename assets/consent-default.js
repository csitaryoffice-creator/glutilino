(function () {
  "use strict";

  var STORAGE_KEY = "glutilino_consent_v1";
  var CONSENT_VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500
  });

  function readConsent() {
    try {
      var value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!value || value.version !== CONSENT_VERSION || !value.savedAt) return null;
      if (Date.now() - value.savedAt > MAX_AGE) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return {
        version: CONSENT_VERSION,
        analytics: value.analytics === true,
        maps: value.maps === true,
        savedAt: value.savedAt
      };
    } catch (error) {
      return null;
    }
  }

  function updateGoogleConsent(value) {
    window.gtag("consent", "update", {
      analytics_storage: value && value.analytics ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: value ? "granted" : "denied",
      personalization_storage: "denied"
    });
  }

  function loadAnalytics(value) {
    if (!value || !value.analytics || document.querySelector("script[data-glutilino-analytics]")) return;
    var meta = document.querySelector('meta[name="google-analytics-id"]');
    var measurementId = meta ? meta.content.trim() : "";
    if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    script.dataset.glutilinoAnalytics = "true";
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { anonymize_ip: true });
  }

  function saveConsent(value) {
    var normalized = {
      version: CONSENT_VERSION,
      analytics: value.analytics === true,
      maps: value.maps === true,
      savedAt: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      /* A hozzájárulási felület tárolás nélkül is használható marad. */
    }
    updateGoogleConsent(normalized);
    loadAnalytics(normalized);
    return normalized;
  }

  var stored = readConsent();
  if (stored) {
    updateGoogleConsent(stored);
    loadAnalytics(stored);
  }

  window.GlutilinoConsentCore = {
    get: readConsent,
    save: saveConsent,
    apply: updateGoogleConsent,
    loadAnalytics: loadAnalytics,
    storageKey: STORAGE_KEY
  };
}());
