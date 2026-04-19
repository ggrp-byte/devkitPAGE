// DevKit Pro — Paddle Checkout v2
// Token i Price ID są publiczne (jak Stripe publishable key) — bezpieczne w kodzie

const PADDLE_TOKEN = 'live_df45a4aba508826b17e3d63a783';
const PADDLE_PRICE_ID = 'pri_01kp4ammpq4jvhk2xvj3e0tcs5';

Paddle.Initialize({
  token: PADDLE_TOKEN,
  eventCallback: function(event) {
    if (event.name === 'checkout.completed') {
      showSuccess(event.data);
    }
  }
});

document.getElementById('buy-btn').addEventListener('click', function() {
  this.disabled = true;
  this.textContent = '⏳ Otwieranie...';

  Paddle.Checkout.open({
    items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      locale: 'pl'
    }
  });

  // Re-enable button after 5s in case user closes overlay
  setTimeout(() => {
    this.disabled = false;
    this.textContent = '🔓 Kup teraz — 150 PLN';
  }, 5000);
});

function generateKey(orderId) {
  // Generate deterministic license key from order ID
  const hash = orderId
    ? orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 12).padEnd(12, 'X')
    : Math.random().toString(36).substring(2, 14).toUpperCase();
  return 'DK-' + hash.substring(0, 4) + '-' + hash.substring(4, 8) + '-' + hash.substring(8, 12);
}

function showSuccess(data) {
  document.querySelector('.card').classList.add('hidden');
  const successBox = document.getElementById('success-box');
  successBox.classList.remove('hidden');

  const key = generateKey(data?.transaction_id || data?.id || '');
  document.getElementById('license-key').textContent = key;

  // Store in localStorage so user can retrieve it again
  localStorage.setItem('devkit_license', key);
}

function copyKey() {
  const key = document.getElementById('license-key').textContent;
  navigator.clipboard.writeText(key).then(() => {
    const btn = document.querySelector('#success-box button');
    btn.textContent = '✅ Skopiowano!';
    setTimeout(() => btn.textContent = '📋 Kopiuj klucz', 2000);
  });
}

// Restore key if already purchased
window.addEventListener('load', function() {
  const saved = localStorage.getItem('devkit_license');
  if (saved) {
    showSuccess({ transaction_id: null });
    document.getElementById('license-key').textContent = saved;
  }
});
