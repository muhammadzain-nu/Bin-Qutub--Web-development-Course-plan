/* ============================================================
   CHAR & CHEESE — Burger Co. Main Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ===================== NAVBAR MOBILE TOGGLE ===================== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    });
  });

  /* ===================== ORDER STATE ===================== */
  let orderState = {
    base: 'Classic Smash',
    basePrice: 650,
    toppings: [],
    sauce: 'Classic Burger Sauce',
    fulfillment: 'Pickup (No DC)',
    location: '',
    payment: 'Cash on Delivery / Pickup',
    quantity: 1,
    placed: false,
    dealLabel: null
  };

  const TOPPING_PRICE = 50;

  /* ===================== ELEMENT REFS ===================== */
  const baseRadios = document.querySelectorAll('input[name="base"]');
  const toppingChecks = document.querySelectorAll('#toppingOptions input[type="checkbox"]');
  const sauceRadios = document.querySelectorAll('input[name="sauce"]');
  const fulfillmentRadios = document.querySelectorAll('input[name="fulfillment"]');
  const paymentRadios = document.querySelectorAll('input[name="payment"]');

  const locationBlock = document.getElementById('locationBlock');
  const locationInput = document.getElementById('locationInput');
  const shareLocBtn = document.getElementById('shareLocBtn');
  const locStatus = document.getElementById('locStatus');

  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');

  const sumBase = document.getElementById('sumBase');
  const sumToppings = document.getElementById('sumToppings');
  const sumSauce = document.getElementById('sumSauce');
  const sumFulfillment = document.getElementById('sumFulfillment');
  const sumLocation = document.getElementById('sumLocation');
  const sumPayment = document.getElementById('sumPayment');
  const sumQty = document.getElementById('sumQty');
  const sumTotal = document.getElementById('sumTotal');

  const placeOrderBtn = document.getElementById('placeOrderBtn');

  /* ===================== TOTAL CALCULATION ===================== */
  function calcTotal() {
    let toppingsTotal = orderState.toppings.length * TOPPING_PRICE;
    let unitPrice = orderState.basePrice + toppingsTotal;
    return unitPrice * orderState.quantity;
  }

  /* ===================== UPDATE SUMMARY UI ===================== */
  function updateSummary() {
    sumBase.textContent = orderState.dealLabel
      ? orderState.base + ' (' + orderState.dealLabel + ' Deal base)'
      : orderState.base;
    sumToppings.textContent = orderState.toppings.length
      ? orderState.toppings.join(', ')
      : 'None';
    sumSauce.textContent = orderState.sauce;
    sumFulfillment.textContent = orderState.fulfillment;
    sumLocation.textContent = orderState.fulfillment === 'Home Delivery'
      ? (orderState.location || 'Not shared yet')
      : 'Pickup — No location needed';
    sumPayment.textContent = orderState.payment;
    sumQty.textContent = orderState.quantity;
    sumTotal.textContent = 'Rs ' + calcTotal().toLocaleString();
  }

  /* ===================== EVENT: BASE BURGER ===================== */
  baseRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (orderState.placed) return;
      orderState.base = e.target.value;
      orderState.basePrice = parseInt(e.target.dataset.price, 10);
      orderState.dealLabel = null;
      updateSummary();
    });
  });

  /* ===================== SELECT BASE FROM MENU / DEALS ===================== */
  const builderSection = document.getElementById('builder');

  function selectBaseBurger(baseName, dealLabel) {
    if (orderState.placed) {
      alert('⚠️ Your order has already been placed and burger choices cannot be changed.');
      return;
    }

    let matched = false;
    baseRadios.forEach(radio => {
      if (radio.value === baseName) {
        radio.checked = true;
        orderState.base = radio.value;
        orderState.basePrice = parseInt(radio.dataset.price, 10);
        matched = true;
      }
    });

    if (!matched) return;

    orderState.dealLabel = dealLabel || null;
    updateSummary();
    builderSection.scrollIntoView({ behavior: 'smooth' });

    // Briefly highlight the order summary so the user notices the change
    const summaryBox = document.getElementById('orderSummary');
    summaryBox.classList.add('summary-flash');
    setTimeout(() => summaryBox.classList.remove('summary-flash'), 1200);
  }

  // Menu cards (clicking anywhere on the card)
  document.querySelectorAll('.menu-card[data-base]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Avoid double-trigger if the inner "Order This" button was clicked
      if (e.target.closest('.menu-order-btn')) return;
      selectBaseBurger(card.dataset.base);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectBaseBurger(card.dataset.base);
      }
    });
  });

  // "Order This" buttons inside menu cards
  document.querySelectorAll('.menu-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectBaseBurger(btn.dataset.base);
    });
  });

  // Deal buttons (Bronze / Premium / Platinum)
  document.querySelectorAll('.deal-btn[data-base]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectBaseBurger(btn.dataset.base, btn.dataset.deal || null);
    });
  });

  /* ===================== EVENT: TOPPINGS ===================== */
  toppingChecks.forEach(check => {
    check.addEventListener('change', (e) => {
      if (orderState.placed) return;
      if (e.target.checked) {
        orderState.toppings.push(e.target.value);
      } else {
        orderState.toppings = orderState.toppings.filter(t => t !== e.target.value);
      }
      updateSummary();
    });
  });

  /* ===================== EVENT: SAUCE ===================== */
  sauceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (orderState.placed) return;
      orderState.sauce = e.target.value;
      updateSummary();
    });
  });

  /* ===================== EVENT: FULFILLMENT ===================== */
  fulfillmentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (orderState.placed) return;
      orderState.fulfillment = e.target.value;
      if (e.target.value === 'Home Delivery') {
        locationBlock.classList.remove('hidden');
      } else {
        locationBlock.classList.add('hidden');
      }
      updateSummary();
    });
  });

  /* ===================== EVENT: SHARE LOCATION ===================== */
  shareLocBtn.addEventListener('click', () => {
    if (orderState.placed) return;

    if (!navigator.geolocation) {
      locStatus.textContent = '⚠️ Geolocation not supported by your browser. Please type your address manually.';
      return;
    }

    locStatus.textContent = '📡 Fetching your location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        const coordsText = `Lat: ${lat}, Lng: ${lng}`;
        locationInput.value = coordsText;
        orderState.location = coordsText;
        locStatus.textContent = '✅ Location captured successfully! You can edit the text above if needed.';
        updateSummary();
      },
      (error) => {
        let msg = '⚠️ Could not fetch location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg += 'Permission denied — please allow location access or type your address manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg += 'Location unavailable. Please type your address manually.';
            break;
          case error.TIMEOUT:
            msg += 'Request timed out. Please try again or type your address manually.';
            break;
          default:
            msg += 'Please type your address manually.';
        }
        locStatus.textContent = msg;
      }
    );
  });

  locationInput.addEventListener('input', (e) => {
    if (orderState.placed) return;
    orderState.location = e.target.value;
    updateSummary();
  });

  /* ===================== EVENT: PAYMENT ===================== */
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (orderState.placed) return;
      orderState.payment = e.target.value;
      updateSummary();
    });
  });

  /* ===================== EVENT: QUANTITY ===================== */
  qtyMinus.addEventListener('click', () => {
    if (orderState.placed) return;
    if (orderState.quantity > 1) {
      orderState.quantity--;
      qtyValue.textContent = orderState.quantity;
      updateSummary();
    }
  });

  qtyPlus.addEventListener('click', () => {
    if (orderState.placed) return;
    if (orderState.quantity < 10) {
      orderState.quantity++;
      qtyValue.textContent = orderState.quantity;
      updateSummary();
    }
  });

  /* ===================== LOCK FORM AFTER ORDER ===================== */
  function lockOrderForm() {
    const allInputs = document.querySelectorAll('.builder-form input, .builder-form button');
    allInputs.forEach(input => {
      input.disabled = true;
      input.style.cursor = 'not-allowed';
    });
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = '✅ Order Placed — Locked';
    placeOrderBtn.style.opacity = '0.6';
    placeOrderBtn.style.cursor = 'not-allowed';
    document.querySelector('.builder-form').style.opacity = '0.7';
    document.querySelector('.builder-form').style.pointerEvents = 'none';
  }

  /* ===================== PLACE ORDER ===================== */
  placeOrderBtn.addEventListener('click', () => {
    if (orderState.placed) return;

    if (orderState.fulfillment === 'Home Delivery' && !orderState.location.trim()) {
      alert('🚴 Please share your delivery location before placing the order, or switch to Pickup.');
      return;
    }

    orderState.placed = true;

    // Generate a fun order ID
    const orderId = 'CC-' + Math.floor(100000 + Math.random() * 900000);

    // Calculate times based on quantity & fulfillment
    const baseCookTime = 8 + (orderState.quantity * 2); // base + 2 mins per item
    const cookingMins = Math.min(baseCookTime, 25);
    let onTheWayMins;

    if (orderState.fulfillment === 'Pickup (No DC)') {
      onTheWayMins = cookingMins; // pickup ready time = cooking time
    } else {
      onTheWayMins = cookingMins + 12 + Math.floor(Math.random() * 6); // delivery adds 12-18 mins
    }

    showChefPopup(orderId, cookingMins, onTheWayMins);
    lockOrderForm();
  });

  /* ===================== CHEF POPUP ===================== */
  const popupOverlay = document.getElementById('popupOverlay');
  const popupClose = document.getElementById('popupClose');
  const popupOkBtn = document.getElementById('popupOkBtn');
  const popupOrderId = document.getElementById('popupOrderId');
  const cookingTime = document.getElementById('cookingTime');
  const wayTime = document.getElementById('wayTime');
  const stepCooking = document.getElementById('stepCooking');
  const stepWay = document.getElementById('stepWay');
  const popupFulfillment = document.getElementById('popupFulfillment');
  const popupPayment = document.getElementById('popupPayment');
  const popupTitle = document.getElementById('popupTitle');

  function showChefPopup(orderId, cookingMins, totalMins) {
    popupOrderId.textContent = `Order ID: ${orderId}`;

    if (orderState.fulfillment === 'Pickup (No DC)') {
      cookingTime.textContent = `Estimated: ${cookingMins} mins until ready for pickup`;
      wayTime.textContent = `Ready for pickup at the counter`;
      stepWay.querySelector('strong').textContent = 'Ready for Pickup';
      stepWay.querySelector('.status-icon').textContent = '🛍️';
    } else {
      cookingTime.textContent = `Estimated: ${cookingMins} mins`;
      wayTime.textContent = `Estimated: ${totalMins} mins total (including delivery)`;
      stepWay.querySelector('strong').textContent = 'On the Way';
      stepWay.querySelector('.status-icon').textContent = '🛵';
    }

    popupFulfillment.textContent = orderState.fulfillment;
    popupPayment.textContent = orderState.payment;

    // Reset steps
    stepCooking.classList.add('active');
    stepCooking.classList.remove('done');
    stepWay.classList.remove('active', 'done');

    popupOverlay.classList.add('active');

    // Simulate progression: after cookingMins (scaled down for demo), move to "on the way"
    const demoDelay = Math.min(cookingMins * 600, 8000); // scaled for demo, max 8s

    setTimeout(() => {
      stepCooking.classList.remove('active');
      stepCooking.classList.add('done');
      stepWay.classList.add('active');

      if (orderState.fulfillment === 'Pickup (No DC)') {
        popupTitle.textContent = `Order Ready! Come grab it, fresh off the grill 🍔`;
      } else {
        popupTitle.textContent = `Order's On The Way! Rider is heading to you 🛵`;
      }
    }, demoDelay);
  }

  function closePopup() {
    popupOverlay.classList.remove('active');
  }

  popupClose.addEventListener('click', closePopup);
  popupOkBtn.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
  });

  /* ===================== FEEDBACK SYSTEM (localStorage) ===================== */
  const feedbackName = document.getElementById('feedbackName');
  const feedbackText = document.getElementById('feedbackText');
  const starRating = document.getElementById('starRating');
  const stars = starRating.querySelectorAll('span');
  const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
  const feedbackStatus = document.getElementById('feedbackStatus');
  const feedbackList = document.getElementById('feedbackList');
  const noFeedbackMsg = document.getElementById('noFeedbackMsg');
  const clearFeedbackBtn = document.getElementById('clearFeedbackBtn');

  const FEEDBACK_KEY = 'charAndCheeseFeedback';
  let selectedRating = 0;

  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value, 10);
      stars.forEach(s => {
        s.classList.toggle('selected', parseInt(s.dataset.value, 10) <= selectedRating);
      });
    });
  });

  function getFeedbackList() {
    try {
      const data = localStorage.getItem(FEEDBACK_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveFeedbackList(list) {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
  }

  function renderFeedbackList() {
    const list = getFeedbackList();
    feedbackList.innerHTML = '';

    if (list.length === 0) {
      feedbackList.appendChild(noFeedbackMsg);
      noFeedbackMsg.style.display = 'block';
      return;
    }

    list.slice().reverse().forEach(item => {
      const div = document.createElement('div');
      div.className = 'feedback-item';

      const starsDisplay = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);

      div.innerHTML = `
        <div class="feedback-item-top">
          <span class="feedback-item-name">${escapeHTML(item.name)}</span>
          <span class="feedback-item-stars">${starsDisplay}</span>
        </div>
        <div class="feedback-item-text">${escapeHTML(item.text)}</div>
        <div class="feedback-item-date">${item.date}</div>
      `;
      feedbackList.appendChild(div);
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  submitFeedbackBtn.addEventListener('click', () => {
    const name = feedbackName.value.trim();
    const text = feedbackText.value.trim();

    if (!name) {
      feedbackStatus.style.color = '#e74c3c';
      feedbackStatus.textContent = '⚠️ Please enter your name.';
      return;
    }
    if (selectedRating === 0) {
      feedbackStatus.style.color = '#e74c3c';
      feedbackStatus.textContent = '⚠️ Please select a star rating.';
      return;
    }
    if (!text) {
      feedbackStatus.style.color = '#e74c3c';
      feedbackStatus.textContent = '⚠️ Please write your feedback.';
      return;
    }

    const list = getFeedbackList();
    list.push({
      name: name,
      rating: selectedRating,
      text: text,
      date: new Date().toLocaleString()
    });
    saveFeedbackList(list);

    // Reset form
    feedbackName.value = '';
    feedbackText.value = '';
    selectedRating = 0;
    stars.forEach(s => s.classList.remove('selected'));

    feedbackStatus.style.color = 'var(--accent-green)';
    feedbackStatus.textContent = '✅ Thank you! Your feedback has been saved.';

    renderFeedbackList();

    setTimeout(() => {
      feedbackStatus.textContent = '';
    }, 4000);
  });

  clearFeedbackBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all feedback stored on this device?')) {
      localStorage.removeItem(FEEDBACK_KEY);
      renderFeedbackList();
    }
  });

  // Initial render of feedback list
  renderFeedbackList();

  /* ===================== FAQ ACCORDION ===================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-q');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  /* ===================== NAVBAR ACTIVE LINK ON SCROLL ===================== */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      }
    });
  });

  /* ===================== INITIAL SUMMARY RENDER ===================== */
  updateSummary();

});
