document.addEventListener('DOMContentLoaded', () => {
  // --- STATE VARIABLES FOR PRICING ---
  const BASE_PRICE = 90; // includes 1 bedroom, 1 bathroom, and up to 1000 sqft
  const ADD_BEDROOM_PRICE = 25;
  const ADD_BATHROOM_PRICE = 35;
  const SQFT_BASE_LIMIT = 1000;
  const SQFT_EXTRA_RATE = 0.05; // $0.05 per sqft above 1000 sqft
  
  const EXTRAS_PRICES = {
    fridge: 30,
    oven: 30,
    cabinets: 40,
    windows: 35,
    pethair: 25
  };

  const SERVICE_MULTIPLIERS = {
    standard: 1.0,
    deep: 1.5,
    move: 1.8
  };

  const FREQUENCY_DISCOUNTS = {
    'one-time': 0.0,
    'weekly': 0.20,
    'every-2-weeks': 0.15,
    'every-3-weeks': 0.10,
    'monthly': 0.05
  };

  // --- SELECTORS ---
  const header = document.querySelector('.header');
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-link');

  // Draggable Sliders Selectors
  const rangeBedrooms = document.getElementById('range-bedrooms');
  const rangeBathrooms = document.getElementById('range-bathrooms');
  const rangeSqft = document.getElementById('range-sqft');
  
  const bedTooltip = document.getElementById('bed-tooltip');
  const bathTooltip = document.getElementById('bath-tooltip');
  const sqftTooltip = document.getElementById('sqft-tooltip');

  // Input Selectors
  const selectService = document.getElementById('select-service');
  const extraCards = document.querySelectorAll('.extra-card');
  const frequencyInputs = document.querySelectorAll('input[name="frequency"]');
  const bookingForm = document.getElementById('booking-form');

  // Pricing Dashboard Selectors
  const summaryServiceType = document.getElementById('sum-service-type');
  const summaryServicePrice = document.getElementById('sum-service-price');
  const summaryRooms = document.getElementById('sum-rooms');
  const summaryRoomsPrice = document.getElementById('sum-rooms-price');
  const sumFrequency = document.getElementById('sum-frequency');
  const sumDiscountRow = document.getElementById('sum-discount-row');
  const sumFrequencyDiscount = document.getElementById('sum-frequency-discount');
  const summaryExtras = document.getElementById('sum-extras');
  const summaryExtrasPrice = document.getElementById('sum-extras-price');
  const summaryTotal = document.getElementById('sum-total');
  const stickyPrice = document.getElementById('sticky-price');

  // Dialog Modals
  const successModal = document.getElementById('success-modal');
  const successCloseBtn = document.getElementById('success-close-btn');
  const serviceModals = {
    standard: document.getElementById('modal-standard'),
    deep: document.getElementById('modal-deep'),
    move: document.getElementById('modal-move')
  };

  // --- STATE INIT ---
  let bedrooms = rangeBedrooms ? parseFloat(rangeBedrooms.value) : 1;
  let bathrooms = rangeBathrooms ? parseFloat(rangeBathrooms.value) : 1;
  let sqft = rangeSqft ? parseInt(rangeSqft.value, 10) : 1000;
  let selectedService = selectService ? selectService.value : 'standard';
  let selectedFrequency = 'one-time';
  let selectedExtras = new Set();

  // Find initial checked frequency
  frequencyInputs.forEach(input => {
    if (input.checked) {
      selectedFrequency = input.value;
    }
  });

  // --- HEADER SCROLL STYLING ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- MOBILE NAVIGATION TOGGLE ---
  if (mobileNavToggle && nav) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('nav-active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-active');
      });
    });

    // Close menu clicking outside
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('nav-active') && !nav.contains(e.target) && !mobileNavToggle.contains(e.target)) {
        nav.classList.remove('nav-active');
      }
    });
  }

  // --- SLIDER HELPER FUNCTIONS ---
  function updateSlider(slider, tooltip, formatValueFn) {
    if (!slider) return;
    const val = parseFloat(slider.value);
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.backgroundSize = percent + '% 100%';
    
    if (tooltip) {
      tooltip.textContent = formatValueFn ? formatValueFn(val) : val;
    }
  }

  function initSliders() {
    if (rangeBedrooms) {
      updateSlider(rangeBedrooms, bedTooltip, (v) => {
        return v === 1 ? '1 Bedroom' : `${v} Bedrooms`;
      });
    }
    if (rangeBathrooms) {
      updateSlider(rangeBathrooms, bathTooltip, (v) => {
        return v === 1 ? '1 Bathroom' : `${v} Bathrooms`;
      });
    }
    if (rangeSqft) {
      updateSlider(rangeSqft, sqftTooltip, (v) => {
        return `about ${v.toLocaleString()} sqft`;
      });
    }
  }

  // Initialize sliders layout track fill and tooltips on load
  initSliders();

  // --- SLIDERS LISTENERS ---
  if (rangeBedrooms) {
    rangeBedrooms.addEventListener('input', (e) => {
      bedrooms = parseFloat(e.target.value);
      updateSlider(rangeBedrooms, bedTooltip, (v) => {
        return v === 1 ? '1 Bedroom' : `${v} Bedrooms`;
      });
      calculatePrice();
    });
  }

  if (rangeBathrooms) {
    rangeBathrooms.addEventListener('input', (e) => {
      bathrooms = parseFloat(e.target.value);
      updateSlider(rangeBathrooms, bathTooltip, (v) => {
        return v === 1 ? '1 Bathroom' : `${v} Bathrooms`;
      });
      calculatePrice();
    });
  }

  if (rangeSqft) {
    rangeSqft.addEventListener('input', (e) => {
      sqft = parseInt(e.target.value, 10);
      updateSlider(rangeSqft, sqftTooltip, (v) => {
        return `about ${v.toLocaleString()} sqft`;
      });
      calculatePrice();
    });
  }

  // --- ESTIMATOR CHANGE HANDLERS ---
  if (selectService) {
    selectService.addEventListener('change', (e) => {
      selectedService = e.target.value;
      calculatePrice();
    });
  }

  // Frequency Radios Listeners
  frequencyInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedFrequency = e.target.value;
        calculatePrice();
      }
    });
  });

  extraCards.forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    
    // Support clicking anywhere on card
    card.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    });

    checkbox.addEventListener('change', () => {
      const extraId = checkbox.value;
      if (checkbox.checked) {
        card.classList.add('selected');
        selectedExtras.add(extraId);
      } else {
        card.classList.remove('selected');
        selectedExtras.delete(extraId);
      }
      calculatePrice();
    });
  });

  // --- CALCULATION LOGIC ---
  function calculatePrice() {
    // 1. Service Type Multiplier on Base Price
    const multiplier = SERVICE_MULTIPLIERS[selectedService] || 1.0;
    const baseCalculated = BASE_PRICE * multiplier;

    // 2. Additional Rooms & Sizing Price
    // Base price covers 1bed and 1bath. Extra beds/baths add cost.
    const addBedsCost = Math.max(0, bedrooms - 1) * ADD_BEDROOM_PRICE;
    const addBathsCost = Math.max(0, bathrooms - 1) * ADD_BATHROOM_PRICE;
    const roomsCost = addBedsCost + addBathsCost;

    // Sizing cost: Base covers up to 1000 sqft. Surcharge for any extra sqft.
    const sqftCost = Math.max(0, sqft - SQFT_BASE_LIMIT) * SQFT_EXTRA_RATE;

    const totalRoomsAndSizeCost = roomsCost + sqftCost;

    // 3. Extras Price
    let extrasTotalCost = 0;
    selectedExtras.forEach(extra => {
      extrasTotalCost += EXTRAS_PRICES[extra] || 0;
    });

    // 4. Subtotal and Frequency Discount
    const subtotal = baseCalculated + totalRoomsAndSizeCost + extrasTotalCost;
    const discountRate = FREQUENCY_DISCOUNTS[selectedFrequency] || 0;
    const discountAmount = subtotal * discountRate;

    // 5. Grand Total
    const grandTotal = subtotal - discountAmount;

    // Update UI elements
    updatePricingDashboard(baseCalculated, totalRoomsAndSizeCost, extrasTotalCost, discountAmount, grandTotal);
  }

  function updatePricingDashboard(baseCost, roomsAndSizeCost, extrasCost, discountAmount, total) {
    if (summaryServiceType) {
      const displayNames = {
        standard: 'Standard Cleaning',
        deep: 'Deep Cleaning',
        move: 'Move-In/Out Clean'
      };
      summaryServiceType.textContent = displayNames[selectedService] || 'Cleaning Service';
    }
    if (summaryServicePrice) summaryServicePrice.textContent = `$${baseCost.toFixed(2)}`;
    
    if (summaryRooms) {
      summaryRooms.textContent = `${bedrooms} Bed, ${bathrooms} Bath (${sqft.toLocaleString()} sqft)`;
    }
    if (summaryRoomsPrice) summaryRoomsPrice.textContent = `$${roomsAndSizeCost.toFixed(2)}`;

    if (sumFrequency) {
      const freqNames = {
        'one-time': 'One Time',
        'weekly': 'Weekly',
        'every-2-weeks': 'Every 2 Weeks',
        'every-3-weeks': 'Every 3 Weeks',
        'monthly': 'Monthly'
      };
      sumFrequency.textContent = freqNames[selectedFrequency] || 'One Time';
    }

    if (sumDiscountRow && sumFrequencyDiscount) {
      if (discountAmount > 0) {
        sumDiscountRow.style.display = 'flex';
        const pct = (FREQUENCY_DISCOUNTS[selectedFrequency] * 100).toFixed(0);
        sumFrequencyDiscount.textContent = `-$${discountAmount.toFixed(2)} (${pct}%)`;
      } else {
        sumDiscountRow.style.display = 'none';
      }
    }
    
    if (summaryExtras) {
      summaryExtras.textContent = selectedExtras.size > 0 ? `${selectedExtras.size} Add-on${selectedExtras.size > 1 ? 's' : ''}` : 'None';
    }
    if (summaryExtrasPrice) summaryExtrasPrice.textContent = `$${extrasCost.toFixed(2)}`;
    
    if (summaryTotal) {
      summaryTotal.textContent = `$${total.toFixed(2)}`;
    }
    if (stickyPrice) {
      stickyPrice.textContent = `$${total.toFixed(2)}`;
    }
  }

  // --- DIALOG MODALS OPEN/CLOSE ---
  // Connect checklist links to show checklist dialogs
  const serviceButtons = document.querySelectorAll('.service-card .btn-secondary');
  serviceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceType = btn.getAttribute('data-service');
      const modal = serviceModals[serviceType];
      if (modal) {
        modal.showModal();
        modal.classList.add('modal-scale-in');
      }
    });
  });

  // Connect close buttons on all modals
  const modalCloseBtns = document.querySelectorAll('.modal-close-btn');
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) {
        dialog.close();
      }
    });
  });

  // Clicking backdrop closes dialog
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        dialog.close();
      }
    });
  });

  // --- FORM SUBMISSION HANDLER ---
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect data for display or validation context
      const nameVal = document.getElementById('txt-name').value;
      const emailVal = document.getElementById('txt-email').value;
      const phoneVal = document.getElementById('txt-phone').value;
      const dateVal = document.getElementById('txt-date').value;

      // Address elements
      const address1Val = document.getElementById('txt-address1').value;
      const cityVal = document.getElementById('txt-city').value;
      const stateVal = document.getElementById('txt-state').value;
      const zipVal = document.getElementById('txt-zip').value;

      // Basic validation
      if (!nameVal || !emailVal || !phoneVal || !dateVal || !address1Val || !cityVal || !stateVal || !zipVal) {
        alert('Please fill out all required fields.');
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (dateVal < todayStr) {
        alert('Please select a current or future date for your booking.');
        return;
      }

      // Show success modal
      if (successModal) {
        successModal.showModal();
        successModal.classList.add('modal-scale-in');
      }

      // Reset form and calculator state
      bookingForm.reset();

      // Reset state variables to defaults
      bedrooms = 1;
      bathrooms = 1;
      sqft = 1000;
      selectedService = 'standard';
      selectedFrequency = 'one-time';
      selectedExtras.clear();

      // Ensure form control representations are set correctly
      if (selectService) selectService.value = 'standard';
      
      const oneTimeRadio = document.querySelector('input[value="one-time"]');
      if (oneTimeRadio) oneTimeRadio.checked = true;

      extraCards.forEach(card => {
        card.classList.remove('selected');
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
      });

      // Update slider visual representation manually
      initSliders();

      // Update pricing calculations back to defaults
      calculatePrice();
    });
  }

  // Close success modal custom hook
  if (successCloseBtn && successModal) {
    successCloseBtn.addEventListener('click', () => {
      successModal.close();
    });
  }

  // --- SCROLL ANIMATION REVEAL (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealOnScroll.observe(element);
  });

  // Set minimum booking date to today
  const txtDate = document.getElementById('txt-date');
  if (txtDate) {
    const today = new Date().toISOString().split('T')[0];
    txtDate.min = today;
  }

  // Initial calculation run to setup dashboard
  calculatePrice();
});

