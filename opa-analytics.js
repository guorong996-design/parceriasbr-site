/* Aggregate page-load counter. No tracking cookies or persistent visitor ID. */
(function () {
  'use strict';
  if (window.__opaParceriasCounted) return;
  if (!/^(www\.)?parceriasbr\.com$/.test(window.location.hostname)) return;
  window.__opaParceriasCounted = true;
  try {
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    var id = Array.from(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    var payload = JSON.stringify({ id: id });
    var url = 'https://opa.plus/api/collect/parceriasbr';
    var send = function () {
      return window.fetch(url, {
        method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
        referrerPolicy: 'origin', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: payload
      }).then(function (response) { if (!response.ok) throw new Error('Counter unavailable'); });
    };
    send().catch(function () { window.setTimeout(function () { send().catch(function () {}); }, 1500); });
  } catch (_) { /* Statistics must never interrupt the website. */ }
}());
