'use strict';

// Scripts des sous-pages : réservation WhatsApp, formulaire de contact, sommaire des services.
(function () {
  var WHATSAPP = 'https://wa.me/2290160208177';
  var EMAIL = 'makeupvinos@gmail.com';

  function formatDate(value) {
    if (!value) return '';
    var parts = value.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function showSent(el, html) {
    el.innerHTML = html;
    el.classList.add('is-visible');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  // --- Services : le sommaire suit la section visible ---
  var chips = document.querySelectorAll('.vm-chip[href^="#"]');
  if (chips.length && 'IntersectionObserver' in window) {
    var byId = {};
    chips.forEach(function (chip) {
      byId[chip.getAttribute('href').slice(1)] = chip;
    });
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          chips.forEach(function (c) { c.classList.remove('is-active'); });
          byId[entry.target.id].classList.add('is-active');
          byId[entry.target.id].scrollIntoView({ block: 'nearest', inline: 'center' });
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();
