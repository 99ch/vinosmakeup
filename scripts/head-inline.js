'use strict';

(function initWebflowModifiers(win, doc) {
  var docEl = doc.documentElement;
  var modifierClass = ' w-mod-';
  docEl.className += modifierClass + 'js';
  if ('ontouchstart' in win || (win.DocumentTouch && doc instanceof DocumentTouch)) {
    docEl.className += modifierClass + 'touch';
  }
})(window, document);

(function initGoogleTagManager(w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var firstScript = d.getElementsByTagName(s)[0];
  var newScript = d.createElement(s);
  var dataLayerParam = l !== 'dataLayer' ? '&l=' + l : '';
  newScript.async = true;
  newScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dataLayerParam;
  firstScript.parentNode.insertBefore(newScript, firstScript);
})(window, document, 'script', 'dataLayer', 'GTM-M799RPH');
