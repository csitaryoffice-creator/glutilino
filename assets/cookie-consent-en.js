(function () {
  "use strict";

  var core = window.GlutilinoConsentCore;
  if (!core) return;

  var current = core.get();
  var lastFocus = null;

  function pizzaIcon() {
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 7C18 7 8 17 7 31c-1 14 10 25 24 26 15 1 26-10 26-25C57 18 47 8 32 7Z"/><path d="M32 13c-11 0-19 8-20 19 0 10 8 19 19 19 11 1 20-8 20-19 0-10-8-19-19-19Z"/><circle cx="23" cy="27" r="3.2"/><circle cx="41" cy="39" r="3.5"/><circle cx="24" cy="43" r="2.3"/><path d="M35 27c3-6 8-7 12-5-1 5-5 8-11 8m0-3c-4-4-8-3-10-1 2 4 5 6 10 5"/></svg>';
  }

  function button(label, className, action) {
    var element = document.createElement("button");
    element.type = "button";
    element.className = className;
    element.textContent = label;
    element.dataset.cookieAction = action;
    return element;
  }

  var banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-modal", "false");
  banner.setAttribute("aria-labelledby", "cookie-banner-title");
  banner.hidden = true;
  banner.innerHTML = '<div class="cookie-banner__mark">' + pizzaIcon() + '</div>' +
    '<div class="cookie-banner__copy"><h2 id="cookie-banner-title">Cookies and external services</h2>' +
    '<p>Beyond essential settings, Google Analytics and Google Maps are activated only after you consent.</p>' +
    '<a href="/en/privacy#sutik">Detailed cookie notice</a></div>';
  var bannerActions = document.createElement("div");
  bannerActions.className = "cookie-actions";
  bannerActions.appendChild(button("Necessary only", "cookie-button cookie-button--quiet", "necessary"));
  bannerActions.appendChild(button("Settings", "cookie-button cookie-button--outline", "settings"));
  bannerActions.appendChild(button("Accept", "cookie-button cookie-button--primary", "accept"));
  banner.appendChild(bannerActions);

  var trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "cookie-trigger";
  trigger.setAttribute("aria-label", "Open cookie settings");
  trigger.title = "Cookie settings";
  trigger.innerHTML = pizzaIcon();
  trigger.hidden = !current;

  var backdrop = document.createElement("div");
  backdrop.className = "cookie-backdrop";
  backdrop.hidden = true;

  var dialog = document.createElement("section");
  dialog.className = "cookie-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "cookie-dialog-title");
  dialog.hidden = true;
  dialog.innerHTML =
    '<button type="button" class="cookie-dialog__close" data-cookie-action="close" aria-label="Cookie settings bezárása">×</button>' +
    '<div class="cookie-dialog__head"><span class="cookie-dialog__icon">' + pizzaIcon() + '</span><div><p class="cookie-eyebrow">Your choice</p><h2 id="cookie-dialog-title">Cookie settings</h2></div></div>' +
    '<p class="cookie-dialog__intro">Essential storage is required for the website to operate securely. You may allow other services separately and change your choice at any time.</p>' +
    '<div class="cookie-choice"><div><h3>Necessary</h3><p>Remembers your choice for up to 12 months. Always active.</p></div><span class="cookie-required">Always active</span></div>' +
    '<label class="cookie-choice"><span><strong>Google Analytics</strong><small>Anonymised usage statistics to improve the website. Works only after a measurement ID is configured.</small></span><input type="checkbox" name="cookie-analytics"><i class="cookie-switch" aria-hidden="true"></i></label>' +
    '<label class="cookie-choice"><span><strong>Google Maps</strong><small>Loads the embedded map. When enabled, data may be sent to Google.</small></span><input type="checkbox" name="cookie-maps"><i class="cookie-switch" aria-hidden="true"></i></label>' +
    '<a class="cookie-policy-link" href="/en/privacy#sutik">Detailed privacy and cookie notice</a>';
  var dialogActions = document.createElement("div");
  dialogActions.className = "cookie-actions cookie-actions--dialog";
  dialogActions.appendChild(button("Necessary only", "cookie-button cookie-button--quiet", "necessary"));
  dialogActions.appendChild(button("Save", "cookie-button cookie-button--outline", "save"));
  dialogActions.appendChild(button("Accept all", "cookie-button cookie-button--primary", "accept"));
  dialog.appendChild(dialogActions);

  document.body.appendChild(banner);
  document.body.appendChild(trigger);
  document.body.appendChild(backdrop);
  document.body.appendChild(dialog);

  function inputsFrom(value) {
    dialog.querySelector('[name="cookie-analytics"]').checked = !!(value && value.analytics);
    dialog.querySelector('[name="cookie-maps"]').checked = !!(value && value.maps);
  }

  function openSettings() {
    lastFocus = document.activeElement;
    inputsFrom(current);
    backdrop.hidden = false;
    dialog.hidden = false;
    document.documentElement.classList.add("cookie-dialog-open");
    dialog.querySelector(".cookie-dialog__close").focus();
  }

  function closeSettings() {
    backdrop.hidden = true;
    dialog.hidden = true;
    document.documentElement.classList.remove("cookie-dialog-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function enableMaps(value) {
    document.querySelectorAll("iframe[data-cookie-src]").forEach(function (frame) {
      var wrap = frame.closest(".google-map-wrap") || frame.parentElement;
      var placeholder = wrap && wrap.querySelector(".cookie-map-placeholder");
      if (value && value.maps) {
        if (!frame.getAttribute("src")) frame.src = frame.dataset.cookieSrc;
        frame.hidden = false;
        if (placeholder) placeholder.remove();
      } else {
        frame.removeAttribute("src");
        frame.hidden = true;
        if (wrap && !placeholder) {
          placeholder = document.createElement("div");
          placeholder.className = "cookie-map-placeholder";
          placeholder.innerHTML = '<span>' + pizzaIcon() + '</span><strong>The map loads only after consent</strong><p>Until then, Google receives no data from your device.</p>';
          placeholder.appendChild(button("Enable Google Maps", "cookie-button cookie-button--primary", "enable-maps"));
          wrap.appendChild(placeholder);
        }
      }
    });
  }

  function commit(value) {
    current = core.save(value);
    banner.hidden = true;
    trigger.hidden = false;
    enableMaps(current);
    closeSettings();
    window.dispatchEvent(new CustomEvent("glutilino:consentchange", { detail: current }));
  }

  function handleAction(action) {
    if (action === "settings") return openSettings();
    if (action === "close") return closeSettings();
    if (action === "necessary") return commit({ analytics: false, maps: false });
    if (action === "accept") return commit({ analytics: true, maps: true });
    if (action === "save") {
      return commit({
        analytics: dialog.querySelector('[name="cookie-analytics"]').checked,
        maps: dialog.querySelector('[name="cookie-maps"]').checked
      });
    }
    if (action === "enable-maps") {
      return commit({ analytics: !!(current && current.analytics), maps: true });
    }
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-cookie-action]");
    if (target) handleAction(target.dataset.cookieAction);
  });
  trigger.addEventListener("click", openSettings);
  backdrop.addEventListener("click", closeSettings);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !dialog.hidden) closeSettings();
  });

  enableMaps(current);
  if (!current) banner.hidden = false;
}());
