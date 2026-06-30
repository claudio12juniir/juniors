(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5511961718624';

  /* ===== Header scroll state + mobile nav ===== */
  var header = document.getElementById('header');
  var navToggle = document.getElementById('navToggle');
  var mobileCtaBar = document.getElementById('mobileCtaBar');
  var cotacaoSection = document.getElementById('cotacao');

  function updateMobileCtaBar() {
    if (!mobileCtaBar || !cotacaoSection) return;
    var rect = cotacaoSection.getBoundingClientRect();
    var formInView = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
    mobileCtaBar.classList.toggle('is-hidden', formInView);
  }

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 10);
    updateMobileCtaBar();
  });
  updateMobileCtaBar();

  navToggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('.main-nav a, .header-actions a').forEach(function (link) {
    link.addEventListener('click', function () {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ===== Footer year ===== */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ===== Scroll reveal ===== */
  var revealEls = document.querySelectorAll('.reveal');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { observer.observe(el); });

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  /* ===== Input masks ===== */
  function maskPhone(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.replace(/^(\d*)/, '($1');
    if (digits.length <= 7) return digits.replace(/^(\d{2})(\d*)/, '($1) $2');
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  function maskCPF(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  function maskCEP(value) {
    var digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/^(\d{5})(\d)/, '$1-$2');
  }

  var whatsappInput = document.getElementById('whatsapp');
  var cpfInput = document.getElementById('cpf');
  var cepInput = document.getElementById('cep');
  var anoInput = document.getElementById('ano');

  whatsappInput.addEventListener('input', function (e) { e.target.value = maskPhone(e.target.value); });
  cpfInput.addEventListener('input', function (e) { e.target.value = maskCPF(e.target.value); });
  cepInput.addEventListener('input', function (e) { e.target.value = maskCEP(e.target.value); });
  anoInput.addEventListener('input', function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });

  /* ===== Multi-step form ===== */
  var form = document.getElementById('leadForm');
  var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
  var progressFill = document.getElementById('progressFill');
  var stepLabels = document.querySelectorAll('[data-step-label]');
  var currentStep = 1;
  var totalSteps = 3;

  function showStep(stepKey) {
    steps.forEach(function (stepEl) {
      stepEl.classList.toggle('active', stepEl.dataset.step === String(stepKey));
    });
    if (typeof stepKey === 'number') {
      progressFill.style.width = (stepKey / totalSteps) * 100 + '%';
      stepLabels.forEach(function (label) {
        label.classList.toggle('active', parseInt(label.dataset.stepLabel, 10) <= stepKey);
      });
    }
  }

  function validateStep(stepEl) {
    var valid = true;
    var fields = stepEl.querySelectorAll('input[required]');
    fields.forEach(function (field) {
      field.classList.remove('invalid');
      if (field.type === 'radio') {
        var group = stepEl.querySelectorAll('input[name="' + field.name + '"]');
        var checked = Array.prototype.some.call(group, function (r) { return r.checked; });
        if (!checked) valid = false;
        return;
      }
      if (field.type === 'checkbox') {
        if (!field.checked) { valid = false; field.classList.add('invalid'); }
        return;
      }
      if (!field.value.trim()) { valid = false; field.classList.add('invalid'); return; }
      if (field.id === 'whatsapp' && field.value.replace(/\D/g, '').length < 10) { valid = false; field.classList.add('invalid'); }
      if (field.id === 'cpf' && field.value.replace(/\D/g, '').length !== 11) { valid = false; field.classList.add('invalid'); }
      if (field.id === 'cep' && field.value.replace(/\D/g, '').length !== 8) { valid = false; field.classList.add('invalid'); }
      if (field.id === 'ano' && field.value.length !== 4) { valid = false; field.classList.add('invalid'); }
    });
    return valid;
  }

  form.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var activeStep = form.querySelector('.form-step.active');
      if (!validateStep(activeStep)) return;
      currentStep = Math.min(currentStep + 1, totalSteps);
      showStep(currentStep);
    });
  });

  form.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentStep = Math.max(currentStep - 1, 1);
      showStep(currentStep);
    });
  });

  /* ===== Submit -> build WhatsApp message ===== */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var activeStep = form.querySelector('.form-step.active');
    if (!validateStep(activeStep)) return;

    var data = {
      nome: document.getElementById('nome').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      veiculo: document.getElementById('veiculo').value.trim(),
      ano: document.getElementById('ano').value.trim(),
      cep: document.getElementById('cep').value.trim(),
      cpf: document.getElementById('cpf').value.trim(),
      sinistro: (form.querySelector('input[name="sinistro"]:checked') || {}).value || ''
    };

    var message = [
      'Olá! Vim pelo site da Junior\'s Proteção Automotiva e quero uma cotação de seguro auto.',
      '',
      '👤 Nome: ' + data.nome,
      '📱 WhatsApp: ' + data.whatsapp,
      '🚗 Veículo: ' + data.veiculo + ' (' + data.ano + ')',
      '📍 CEP (pernoite): ' + data.cep,
      '🪪 CPF condutor principal: ' + data.cpf,
      '⚠️ Sinistro nos últimos 12 meses: ' + data.sinistro,
      '',
      'Aguardo o contato, obrigado!'
    ].join('\n');

    var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    document.getElementById('whatsappFallback').href = whatsappUrl;

    showStep('success');
    progressFill.style.width = '100%';

    window.setTimeout(function () {
      window.open(whatsappUrl, '_blank', 'noopener');
    }, 900);
  });

})();
