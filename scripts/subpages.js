'use strict';

// Scripts des sous-pages : photos, galerie, réservation WhatsApp, formulaire de contact.
(function () {
  var WHATSAPP = 'https://wa.me/2290160208177';
  var EMAIL = 'makeupvinos@gmail.com';

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function formatDate(value) {
    if (!value) return '';
    var parts = value.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function showSent(node, html) {
    node.innerHTML = html;
    node.classList.add('is-visible');
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --- Emplacements photo : la photo apparaît dès que le fichier existe ---
  document.querySelectorAll('[data-photo]').forEach(function (box) {
    var img = new Image();
    img.onload = function () {
      img.alt = box.getAttribute('data-alt') || '';
      img.loading = 'lazy';
      box.textContent = '';
      box.appendChild(img);
    };
    img.src = box.getAttribute('data-photo');
  });

  // --- Galerie : les photos viennent de scripts/gallery-data.js ---
  var grid = document.getElementById('gallery-grid');
  if (grid) {
    var CATEGORIES = [
      ['cils', 'Cils'],
      ['sourcils', 'Sourcils'],
      ['ongles', 'Ongles'],
      ['epilation', 'Épilation'],
      ['maquillage', 'Maquillage durable'],
      ['corps', 'Soins du corps']
    ];
    var labels = {};
    CATEGORIES.forEach(function (c) { labels[c[0]] = c[1]; });

    var items = Array.isArray(window.VM_GALLERY) ? window.VM_GALLERY.slice() : [];
    var preview = items.length === 0;
    if (preview) {
      var heights = [440, 300, 380, 320, 460, 300, 380, 340, 420];
      items = heights.map(function (h, i) {
        return { cat: CATEGORIES[i % CATEGORIES.length][0], title: 'Photo à ajouter', height: h };
      });
    }

    var tabs = document.getElementById('gallery-tabs');
    var tiles = [];
    var visible = [];
    var current = 0;

    var lightbox = document.getElementById('gallery-lightbox');
    var lbImg = lightbox.querySelector('img');
    var lbCap = lightbox.querySelector('figcaption');

    function show(index) {
      current = (index + visible.length) % visible.length;
      var item = visible[current];
      lbImg.src = item.src;
      lbImg.alt = item.title || '';
      lbCap.textContent = (item.title ? item.title + ' · ' : '') + (labels[item.cat] || '');
    }
    function open(item) {
      visible = items.filter(function (it) { return it.src && tiles[items.indexOf(it)] && !tiles[items.indexOf(it)].hidden; });
      show(visible.indexOf(item));
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    items.forEach(function (item) {
      var fig = el('figure', 'vm-tile');
      var media;
      if (item.src) {
        var btn = el('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Agrandir : ' + (item.title || labels[item.cat]));
        var img = new Image();
        img.src = item.src;
        img.alt = item.title || '';
        img.loading = 'lazy';
        btn.appendChild(img);
        btn.addEventListener('click', function () { open(item); });
        media = btn;
      } else {
        media = el('div', 'vm-media');
        media.style.height = item.height + 'px';
        media.appendChild(el('div', 'vm-ph', 'Photo à ajouter'));
      }
      fig.appendChild(media);
      var cap = el('figcaption');
      cap.appendChild(el('b', '', item.title || ''));
      cap.firstChild.style.fontWeight = '400';
      cap.appendChild(el('span', '', labels[item.cat] || ''));
      fig.appendChild(cap);
      grid.appendChild(fig);
      tiles.push(fig);
    });

    var used = {};
    items.forEach(function (it) { used[it.cat] = true; });
    var buttons = [];
    function addTab(key, label) {
      var b = el('button', '', label);
      b.type = 'button';
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
        items.forEach(function (it, i) { tiles[i].hidden = key !== 'all' && it.cat !== key; });
      });
      tabs.appendChild(b);
      buttons.push(b);
      return b;
    }
    var all = addTab('all', 'Tous');
    all.classList.add('is-on');
    CATEGORIES.forEach(function (c) {
      if (used[c[0]]) addTab(c[0], c[1]);
    });

    var wanted = new URLSearchParams(window.location.search).get('cat');
    CATEGORIES.forEach(function (c, i) {
      if (c[0] === wanted && used[c[0]]) {
        buttons.filter(function (b) { return b.textContent === c[1]; }).forEach(function (b) { b.click(); });
      }
    });

    lightbox.querySelector('.is-close').addEventListener('click', close);
    lightbox.querySelector('.is-prev').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('.is-next').addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // --- Rendez-vous : la demande part sur WhatsApp, déjà rédigée ---
  var booking = document.getElementById('booking-form');
  if (booking) {
    var date = booking.elements.date;
    date.min = new Date().toISOString().split('T')[0];

    var wanted = new URLSearchParams(window.location.search).get('service');
    if (wanted) booking.elements.service.value = wanted;

    booking.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = booking.elements;
      var lines = [
        "Bonjour VINO'S MAKEUP, je souhaite prendre rendez-vous.",
        '',
        'Nom : ' + f.firstname.value.trim() + ' ' + f.lastname.value.trim(),
        'Téléphone : ' + f.phone.value.trim(),
        'Soin souhaité : ' + f.service.value,
        'Date : ' + formatDate(f.date.value),
        'Heure : ' + f.time.value
      ];
      if (f.message.value.trim()) lines.push('Message : ' + f.message.value.trim());

      var link = WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(link, '_blank', 'noopener');
      showSent(
        document.getElementById('booking-sent'),
        '<strong>Votre demande est prête dans WhatsApp.</strong> Envoyez le message pour qu’elle nous parvienne. ' +
          'Si WhatsApp ne s’est pas ouvert, <a href="' + link + '" target="_blank" rel="noopener">cliquez ici</a>.'
      );
    });
  }

  // --- Contact : ouvre la messagerie avec le message rédigé ---
  var contact = document.getElementById('contact-form');
  if (contact) {
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = contact.elements;
      var body = [
        f.message.value.trim(),
        '',
        '— ' + f.name.value.trim(),
        f.email.value.trim(),
        f.phone.value.trim()
      ].join('\n');
      var link =
        'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(f.subject.value.trim()) +
        '&body=' + encodeURIComponent(body);
      window.location.href = link;
      showSent(
        document.getElementById('contact-sent'),
        '<strong>Votre messagerie s’ouvre avec le message prêt.</strong> Il ne reste qu’à l’envoyer. ' +
          'Vous pouvez aussi nous écrire sur <a href="' + WHATSAPP + '" target="_blank" rel="noopener">WhatsApp</a>.'
      );
    });
  }
})();
