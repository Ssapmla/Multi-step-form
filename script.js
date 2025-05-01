document.addEventListener('DOMContentLoaded', function() {
  // Form state
  const formData = {
    plan: 'arcade',
    billingCycle: 'monthly',
    addons: ['online', 'storage'],
    personalInfo: {
      name: '',
      email: '',
      phone: ''
    }
  };

  // Cache DOM elements
  const stepNumbers = document.querySelectorAll('.step-number');
  const formSteps = document.querySelectorAll('.form-step');
  const nextButtons = document.querySelectorAll('.next-btn');
  const backButtons = document.querySelectorAll('.back-btn');
  const planCards = document.querySelectorAll('.plan-card');
  const billingSwitch = document.getElementById('billing-switch');
  const billingOptions = document.querySelectorAll('.billing-option');
  const addonCards = document.querySelectorAll('.addon-card');
  const addonCheckboxes = document.querySelectorAll('.addon-card input[type="checkbox"]');
  const confirmButton = document.querySelector('.confirm-btn');
  const changeLink = document.querySelector('.change-link');
  
  // Form inputs for step 1
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  
  // Bouton Next Step pour l'étape 1
  const step1NextButton = document.querySelector('#step1 .next-btn');
  
  // Set initial state
  updateSummary();
  updateSelectedAddons();
  updateNextButtonState();
  
  // Mark checked add-ons as selected
  addonCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      checkbox.closest('.addon-card').classList.add('selected');
    }
  });

  // Event Listeners
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      const currentStep = parseInt(this.getAttribute('data-next')) - 1;
      const nextStep = parseInt(this.getAttribute('data-next'));
      
      if (currentStep === 0) {
        if (!validatePersonalInfo()) {
          return;
        }
      }
      
      goToStep(nextStep);
    });
  });

  backButtons.forEach(button => {
    button.addEventListener('click', function() {
      const prevStep = parseInt(this.getAttribute('data-prev'));
      goToStep(prevStep);
    });
  });

  planCards.forEach(card => {
    card.addEventListener('click', function() {
      const plan = this.getAttribute('data-plan');
      selectPlan(plan);
    });
  });

  billingSwitch.addEventListener('change', function() {
    toggleBilling(this.checked);
  });

  addonCards.forEach(card => {
    card.addEventListener('click', function() {
      const checkbox = this.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;
      this.classList.toggle('selected', checkbox.checked);
      
      updateSelectedAddons();
      updateSummary();
    });
  });

  confirmButton.addEventListener('click', function() {
    goToStep(5); // Go to thank you page
  });

  changeLink.addEventListener('click', function(e) {
    e.preventDefault();
    const targetStep = parseInt(this.getAttribute('data-step'));
    goToStep(targetStep);
  });

  // Ajouter des écouteurs d'événements pour valider les champs lors de la saisie
  nameInput.addEventListener('blur', function() {
    validateField(this, 'name');
    updateNextButtonState();
  });
  
  emailInput.addEventListener('blur', function() {
    validateField(this, 'email');
    updateNextButtonState();
  });
  
  phoneInput.addEventListener('blur', function() {
    validateField(this, 'phone');
    updateNextButtonState();
  });
  
  // Valider les champs pendant la saisie pour donner un retour immédiat
  nameInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      validateField(this, 'name');
    }
    updateNextButtonState();
  });
  
  emailInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      validateField(this, 'email');
    }
    updateNextButtonState();
  });
  
  phoneInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      validateField(this, 'phone');
    }
    updateNextButtonState();
  });

  // Functions
  function goToStep(stepNumber) {
    // Update step indicators
    stepNumbers.forEach(num => {
      num.classList.remove('active');
    });
    
    if (stepNumber <= 4) {
      stepNumbers[stepNumber - 1].classList.add('active');
    }
    
    // Hide all steps and show the target step
    formSteps.forEach(step => {
      step.classList.remove('active');
    });
    
    const targetStep = stepNumber === 5 ? document.getElementById('thank-you') : document.getElementById(`step${stepNumber}`);
    targetStep.classList.add('active');
    
    // Update summary if going to step 4
    if (stepNumber === 4) {
      updateSummary();
    }
    
    // Scroll to top on mobile
    window.scrollTo(0, 0);
  }

  function selectPlan(plan) {
    formData.plan = plan;
    
    // Update UI
    planCards.forEach(card => {
      card.classList.remove('selected');
      if (card.getAttribute('data-plan') === plan) {
        card.classList.add('selected');
      }
    });
    
    updateSummary();
  }

  function toggleBilling(isYearly) {
    formData.billingCycle = isYearly ? 'yearly' : 'monthly';
    
    // Update UI for billing options
    billingOptions.forEach(option => {
      option.classList.remove('active');
    });
    
    if (isYearly) {
      billingOptions[1].classList.add('active');
      document.querySelectorAll('.yearly-offer').forEach(offer => {
        offer.style.display = 'block';
      });
    } else {
      billingOptions[0].classList.add('active');
      document.querySelectorAll('.yearly-offer').forEach(offer => {
        offer.style.display = 'none';
      });
    }
    
    // Update prices
    updatePrices();
    updateSummary();
  }

  function updatePrices() {
    const isYearly = formData.billingCycle === 'yearly';
    
    // Update plan prices
    document.querySelectorAll('.plan-price').forEach(price => {
      price.textContent = isYearly ? price.getAttribute('data-yearly') : price.getAttribute('data-monthly');
    });
    
    // Update addon prices
    document.querySelectorAll('.addon-price').forEach(price => {
      price.textContent = isYearly ? price.getAttribute('data-yearly') : price.getAttribute('data-monthly');
    });
  }

  function updateSelectedAddons() {
    formData.addons = [];
    
    addonCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const addonType = checkbox.closest('.addon-card').getAttribute('data-addon');
        formData.addons.push(addonType);
      }
    });
  }

  function updateSummary() {
    const planName = document.getElementById('summary-plan-name');
    const billingType = document.getElementById('summary-billing-type');
    const planCost = document.getElementById('summary-plan-cost');
    const summaryPeriod = document.getElementById('summary-period');
    const totalCost = document.getElementById('summary-total');
    const summaryAddons = document.querySelector('.summary-addons');
    
    const isYearly = formData.billingCycle === 'yearly';
    
    // Set plan details
    planName.textContent = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
    billingType.textContent = isYearly ? 'Yearly' : 'Monthly';
    planCost.textContent = getPlanPrice(formData.plan, isYearly);
    summaryPeriod.textContent = isYearly ? 'year' : 'month';
    
    // Clear and rebuild addons
    summaryAddons.innerHTML = '';
    
    let totalPrice = getPlanPriceValue(formData.plan, isYearly);
    
    // Add selected addons to summary
    formData.addons.forEach(addon => {
      const addonName = getAddonName(addon);
      const addonPrice = getAddonPrice(addon, isYearly);
      const addonValue = getAddonPriceValue(addon, isYearly);
      
      const addonElement = document.createElement('div');
      addonElement.className = 'summary-addon';
      addonElement.innerHTML = `
        <span class="summary-addon-name">${addonName}</span>
        <span class="summary-addon-price">${addonPrice}</span>
      `;
      
      summaryAddons.appendChild(addonElement);
      totalPrice += addonValue;
    });
    
    // Update total
    totalCost.textContent = isYearly ? `+$${totalPrice}/yr` : `+$${totalPrice}/mo`;
  }

  function validatePersonalInfo() {
    let isValid = true;
    
    // Valider chaque champ individuellement
    if (!validateField(nameInput, 'name')) {
      isValid = false;
    }
    
    if (!validateField(emailInput, 'email')) {
      isValid = false;
    }
    
    if (!validateField(phoneInput, 'phone')) {
      isValid = false;
    }
    
    // Enregistrer les données si tout est valide
    if (isValid) {
      formData.personalInfo = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
      };
    } else {
      // Ajouter l'animation de secousse si la validation échoue
      const form = document.getElementById('personal-info-form');
      form.classList.add('shake');
      
      // Supprimer la classe après la fin de l'animation
      setTimeout(() => {
        form.classList.remove('shake');
      }, 600); // Durée de l'animation
    }
    
    return isValid;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPhone(phone) {
    // Accepte les formats communs de numéros de téléphone internationaux
    // Exemples: +1 123 456 7890, (123) 456-7890, 123-456-7890, etc.
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,3}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}$/;
    return phoneRegex.test(phone);
  }

  // Helper functions for pricing
  function getPlanPrice(plan, isYearly) {
    const prices = {
      arcade: { monthly: '$9/mo', yearly: '$90/yr' },
      advanced: { monthly: '$12/mo', yearly: '$120/yr' },
      pro: { monthly: '$15/mo', yearly: '$150/yr' }
    };
    
    return isYearly ? prices[plan].yearly : prices[plan].monthly;
  }

  function getPlanPriceValue(plan, isYearly) {
    const prices = {
      arcade: { monthly: 9, yearly: 90 },
      advanced: { monthly: 12, yearly: 120 },
      pro: { monthly: 15, yearly: 150 }
    };
    
    return isYearly ? prices[plan].yearly : prices[plan].monthly;
  }

  function getAddonName(addon) {
    const names = {
      online: 'Online service',
      storage: 'Larger storage',
      profile: 'Customizable profile'
    };
    
    return names[addon];
  }

  function getAddonPrice(addon, isYearly) {
    const prices = {
      online: { monthly: '+$1/mo', yearly: '+$10/yr' },
      storage: { monthly: '+$2/mo', yearly: '+$20/yr' },
      profile: { monthly: '+$2/mo', yearly: '+$20/yr' }
    };
    
    return isYearly ? prices[addon].yearly : prices[addon].monthly;
  }

  function getAddonPriceValue(addon, isYearly) {
    const prices = {
      online: { monthly: 1, yearly: 10 },
      storage: { monthly: 2, yearly: 20 },
      profile: { monthly: 2, yearly: 20 }
    };
    
    return isYearly ? prices[addon].yearly : prices[addon].monthly;
  }

  // Fonction pour valider un champ spécifique
  function validateField(input, fieldType) {
    const errorElement = document.getElementById(`${fieldType}-error`);
    input.classList.remove('error');
    errorElement.textContent = '';
    
    // Valider en fonction du type de champ
    if (!input.value.trim()) {
      input.classList.add('error');
      errorElement.textContent = 'Ce champ est obligatoire';
      return false;
    }
    
    switch (fieldType) {
      case 'email':
        if (!isValidEmail(input.value)) {
          input.classList.add('error');
          errorElement.textContent = 'Format d\'email invalide';
          return false;
        }
        break;
      case 'phone':
        if (!isValidPhone(input.value)) {
          input.classList.add('error');
          errorElement.textContent = 'Format de téléphone invalide';
          return false;
        }
        break;
    }
    
    return true;
  }

  // Fonction pour vérifier si tous les champs du formulaire sont remplis correctement
  function updateNextButtonState() {
    // Vérifier si tous les champs sont remplis et valides
    const nameValid = nameInput.value.trim() !== '' && !nameInput.classList.contains('error');
    const emailValid = emailInput.value.trim() !== '' && !emailInput.classList.contains('error');
    const phoneValid = phoneInput.value.trim() !== '' && !phoneInput.classList.contains('error');
    
    // Activer/désactiver le bouton en fonction de l'état de validation
    if (nameValid && emailValid && phoneValid) {
      step1NextButton.removeAttribute('disabled');
      step1NextButton.classList.remove('disabled');
    } else {
      step1NextButton.setAttribute('disabled', 'disabled');
      step1NextButton.classList.add('disabled');
    }
  }

  // Initialize the form with default plan
  selectPlan('arcade');
}); 