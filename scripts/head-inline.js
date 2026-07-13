'use strict';

(function initWebflowModifiers(win, doc) {
  var docEl = doc.documentElement;
  var modifierClass = ' w-mod-';
  docEl.className += modifierClass + 'js';
  if ('ontouchstart' in win || (win.DocumentTouch && doc instanceof DocumentTouch)) {
    docEl.className += modifierClass + 'touch';
  }
})(window, document);
