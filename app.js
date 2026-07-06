/**
 * Isabel Nail Atelier - App Logic (Single Page Application Booking Flow)
 */

// --- Configuration Constants ---
const WHATSAPP_PHONE = "+584146802223"; // Format: CountryCode + AreaCode + Number (No +, No spaces)

const SERVICES = [
    {
        id: 'manicura-rusa',
        name: 'Manicura Rusa',
        description: 'Limpieza profunda de cutículas con torno y nivelación de uña natural con base rubber. Acabado impecable y duradero.',
        duration: 60,
        price: 25,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
    },
    {
        id: 'esculpidas-gel',
        name: 'Esculpidas en Gel',
        description: 'Extensión y esculpido de uñas con gel constructor de alta resistencia. Ideal para lucir el largo y la forma deseada.',
        duration: 90,
        price: 45,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>`
    },
    {
        id: 'semipermanente',
        name: 'Esmaltado Semipermanente',
        description: 'Limpieza exprés y esmaltado de alta duración curado en cabina LED. Brillo impecable y durabilidad de 15 a 21 días.',
        duration: 45,
        price: 20,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
    },
    {
        id: 'nail-art',
        name: 'Nail Art Especial',
        description: 'Decoraciones artísticas a mano alzada, efectos holográficos/chrome, cristales o diseños personalizados en tendencia.',
        duration: 30,
        price: 15,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 18.5 6.00002 18 7.00002 18C8.50002 18 9.00002 19.5 10.5 19.5C12 19.5 12.5 18 14 18C15 18 15.5 18.5 16.0381 18.9958C17.2514 18.2571 18.1965 17.0799 18.6651 15.6881C17.7554 15.2003 17 14.2848 17 13C17 11.078 18.3 9.5 20.2188 9.5C20.0818 7.74922 19.3496 6.13637 18.2325 4.88701C17.0377 5.58988 15.5909 6 14 6C11.2386 6 9 3.76142 9 1C5.77665 1.57962 3.16786 3.84074 2.29688 6.84088C3.12585 7.42082 3.5 8.35853 3.5 9.5C3.5 11.43 5.07 13 7 13C7.42531 13 7.82914 12.9238 8.20166 12.7845C8.68307 14.1569 9.60533 15.3093 10.7937 16.0384C10.2522 16.5298 9.5 17 8.5 17C7.3 17 6.6 16.2 5.5 16.2C4.7 16.2 4.1 16.6 3.55173 17.0988C2.56815 15.6496 2 13.8916 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"/></svg>`
    }
];

const TIME_SLOTS = {
    morning: ["09:00", "09:45", "10:30", "11:15", "12:00"],
    afternoon: ["14:00", "14:45", "15:30", "16:15", "17:00", "17:45", "18:30"]
};

// --- App State ---
let bookingState = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null, // Date object
    selectedTime: null, // String (e.g. '10:30')
    clientData: {
        name: "",
        phone: "",
        notes: ""
    }
};

// Calendar control variables
let calendarCurrentDate = new Date(); // Date being viewed in calendar (starts at today)

// --- DOM elements cache ---
let dom = {};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    cacheDomElements();
    setupEventListeners();
    renderServicesList();
    initCalendar();
});

function cacheDomElements() {
    dom = {
        // Main views
        homeView: document.getElementById("home-view"),
        bookingView: document.getElementById("booking-view"),
        header: document.getElementById("main-header"),

        // Navigation / Trigger Buttons
        btnNavBook: document.getElementById("btn-nav-book"),
        btnHeroBook: document.getElementById("btn-hero-book"),
        btnBackHome: document.getElementById("btn-back-home"),
        btnTriggerBooking: document.querySelectorAll(".btn-book-trigger"),
        navLogo: document.getElementById("nav-logo"),

        // Progress tracker
        progressLine: document.getElementById("progress-line"),
        stepIndicators: document.querySelectorAll(".step-indicator"),
        stepPanels: document.querySelectorAll(".step-panel"),

        // Step 1
        servicesContainer: document.getElementById("services-options-container"),
        btnStep1Next: document.getElementById("btn-step1-next"),

        // Step 2 (Date & Time)
        calendarMonthYear: document.getElementById("calendar-month-year"),
        calendarPrevMonth: document.getElementById("calendar-prev-month"),
        calendarNextMonth: document.getElementById("calendar-next-month"),
        calendarDaysContainer: document.getElementById("calendar-days-container"),
        selectedDateLabel: document.getElementById("selected-date-label"),
        slotsContainer: document.getElementById("slots-container"),
        morningSlots: document.getElementById("morning-slots"),
        afternoonSlots: document.getElementById("afternoon-slots"),
        btnStep2Back: document.getElementById("btn-step2-back"),
        btnStep2Next: document.getElementById("btn-step2-next"),

        // Step 3 (Client Form)
        custForm: document.getElementById("customer-form"),
        custName: document.getElementById("cust-name"),
        custPhone: document.getElementById("cust-phone"),
        custNotes: document.getElementById("cust-notes"),
        errorCustName: document.getElementById("error-cust-name"),
        errorCustPhone: document.getElementById("error-cust-phone"),
        btnStep3Back: document.getElementById("btn-step3-back"),
        btnStep3Next: document.getElementById("btn-step3-next"),

        // Step 4 (Confirmation)
        sumServiceName: document.getElementById("sum-service-name"),
        sumServiceDuration: document.getElementById("sum-service-duration"),
        sumServicePrice: document.getElementById("sum-service-price"),
        sumDatetime: document.getElementById("sum-datetime"),
        sumTime: document.getElementById("sum-time"),
        sumClientName: document.getElementById("sum-client-name"),
        sumClientPhone: document.getElementById("sum-client-phone"),
        sumClientNotes: document.getElementById("sum-client-notes"),
        sumNotesContainer: document.getElementById("sum-notes-container"),
        sumTotalPrice: document.getElementById("sum-total-price"),
        btnStep4Back: document.getElementById("btn-step4-back"),
        btnConfirmBooking: document.getElementById("btn-confirm-booking"),

        // Success Overlay & Confetti
        successScreen: document.getElementById("success-screen"),
        btnManualWhatsapp: document.getElementById("btn-manual-whatsapp"),
        confettiCanvas: document.getElementById("confetti-canvas")
    };
}

function setupEventListeners() {
    // SPA navigation: Switch to booking flow
    const startBooking = () => {
        showView("booking");
        goToStep(1);
    };

    dom.btnNavBook.addEventListener("click", startBooking);
    dom.btnHeroBook.addEventListener("click", startBooking);
    dom.btnTriggerBooking.forEach(btn => btn.addEventListener("click", startBooking));

    // Return to landing
    dom.btnBackHome.addEventListener("click", () => {
        showView("home");
    });
    dom.navLogo.addEventListener("click", (e) => {
        e.preventDefault();
        showView("home");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Step navigation buttons
    dom.btnStep1Next.addEventListener("click", () => goToStep(2));

    dom.btnStep2Back.addEventListener("click", () => goToStep(1));
    dom.btnStep2Next.addEventListener("click", () => goToStep(3));

    dom.btnStep3Back.addEventListener("click", () => goToStep(2));
    dom.btnStep3Next.addEventListener("click", handleStep3Submission);

    dom.btnStep4Back.addEventListener("click", () => goToStep(3));
    dom.btnConfirmBooking.addEventListener("click", handleConfirmBooking);

    // Calendar Nav
    dom.calendarPrevMonth.addEventListener("click", () => navigateMonth(-1));
    dom.calendarNextMonth.addEventListener("click", () => navigateMonth(1));

    // Form Realtime Validation Checks
    dom.custName.addEventListener("input", () => validateField(dom.custName, dom.errorCustName));
    dom.custPhone.addEventListener("input", () => validateField(dom.custPhone, dom.errorCustPhone, 'phone'));
}

// --- View Router ---
function showView(view) {
    if (view === "booking") {
        dom.homeView.classList.remove("active");
        setTimeout(() => {
            dom.homeView.style.display = "none";
            dom.bookingView.style.display = "flex";
            setTimeout(() => {
                dom.bookingView.classList.add("active");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }, 300);

        // Hide navbar buttons / or style differently for booking flow focus
        dom.btnNavBook.style.display = "none";
    } else {
        dom.bookingView.classList.remove("active");
        setTimeout(() => {
            dom.bookingView.style.display = "none";
            dom.homeView.style.display = "block";
            setTimeout(() => {
                dom.homeView.classList.add("active");
            }, 50);
        }, 300);

        dom.btnNavBook.style.display = "inline-flex";
    }
}

// --- Step Wizard Logic ---
function goToStep(step) {
    if (step < 1 || step > 4) return;

    bookingState.currentStep = step;

    // Update progress tracker line
    const percent = ((step - 1) / 3) * 100;
    dom.progressLine.style.width = `${percent}%`;

    // Update Step indicators styles
    dom.stepIndicators.forEach(ind => {
        const indStep = parseInt(ind.getAttribute("data-step"));
        if (indStep === step) {
            ind.className = "step-indicator active";
        } else if (indStep < step) {
            ind.className = "step-indicator completed";
        } else {
            ind.className = "step-indicator";
        }
    });

    // Switch Panels with fade effect
    dom.stepPanels.forEach(panel => {
        panel.classList.remove("active");
    });

    const activePanel = document.getElementById(`step-panel-${step}`);
    activePanel.classList.add("active");

    // Execute specific step initiation routines
    if (step === 2) {
        updateDateAndTimeUI();
    } else if (step === 4) {
        populateSummaryTicket();
    }

    // Scroll container to top
    const wizardHeader = document.querySelector(".booking-wizard-header");
    wizardHeader.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Step 1: Services List Loading ---
function renderServicesList() {
    dom.servicesContainer.innerHTML = "";

    SERVICES.forEach(service => {
        const card = document.createElement("div");
        card.className = "service-select-card";
        card.setAttribute("data-id", service.id);

        card.innerHTML = `
            <div class="service-card-icon">
                ${service.icon}
            </div>
            <div class="service-card-details">
                <h4>${service.name}</h4>
                <p>${service.description}</p>
            </div>
            <div class="service-card-meta">
                <span class="service-card-price">$${service.price} USD</span>
                <span class="service-card-duration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>${service.duration} min</span>
                </span>
            </div>
            <div class="service-select-indicator">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
        `;

        card.addEventListener("click", () => selectService(service));
        dom.servicesContainer.appendChild(card);
    });
}

function selectService(service) {
    bookingState.selectedService = service;

    // Update visual selection states
    document.querySelectorAll(".service-select-card").forEach(card => {
        if (card.getAttribute("data-id") === service.id) {
            card.classList.add("selected");
        } else {
            card.classList.remove("selected");
        }
    });

    // Enable Next button
    dom.btnStep1Next.removeAttribute("disabled");
}

// --- Step 2: Custom Calendar ---
const MONTHS_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function initCalendar() {
    renderCalendar();
}

function navigateMonth(direction) {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + direction);
    renderCalendar();
}

function renderCalendar() {
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();

    // Set Header
    dom.calendarMonthYear.textContent = `${MONTHS_ES[month]} ${year}`;

    // Disable previous month button if we are looking at current month
    const today = new Date();
    const isCurrentMonth = (year === today.getFullYear() && month === today.getMonth());
    dom.calendarPrevMonth.disabled = isCurrentMonth;

    // Clear days
    dom.calendarDaysContainer.innerHTML = "";

    // Days in Month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // First day of week index (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Render blank days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
        const blank = document.createElement("div");
        blank.className = "calendar-day day-disabled";
        dom.calendarDaysContainer.appendChild(blank);
    }

    // Render active days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayButton = document.createElement("button");
        dayButton.className = "calendar-day";
        dayButton.textContent = day;

        const cellDate = new Date(year, month, day);

        // Format checking to see if today
        const isToday = cellDate.getDate() === today.getDate() &&
            cellDate.getMonth() === today.getMonth() &&
            cellDate.getFullYear() === today.getFullYear();

        if (isToday) {
            dayButton.classList.add("day-today");
        }

        // Disable past dates
        // Compare values at midnight to avoid hour differences
        const cellMidnight = new Date(year, month, day).setHours(0, 0, 0, 0);
        const todayMidnight = new Date().setHours(0, 0, 0, 0);

        // Closed on Sundays rule (Sunday index is 0)
        const isSunday = cellDate.getDay() === 0;

        if (cellMidnight < todayMidnight || isSunday) {
            dayButton.classList.add("day-disabled");
            dayButton.disabled = true;
        } else {
            // Selected Day visual state
            if (bookingState.selectedDate &&
                cellDate.getDate() === bookingState.selectedDate.getDate() &&
                cellDate.getMonth() === bookingState.selectedDate.getMonth() &&
                cellDate.getFullYear() === bookingState.selectedDate.getFullYear()) {
                dayButton.classList.add("day-selected");
            }

            dayButton.addEventListener("click", () => handleDateSelection(cellDate));
        }

        dom.calendarDaysContainer.appendChild(dayButton);
    }
}

function handleDateSelection(date) {
    bookingState.selectedDate = date;
    bookingState.selectedTime = null; // Reset selected time slots

    // Refresh calendar rendering to show selection
    renderCalendar();

    // Update selected date text
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = date.toLocaleDateString('es-ES', options);
    // Capitalize first letter
    dom.selectedDateLabel.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    // Unlock and Load Time slots
    dom.slotsContainer.classList.remove("slots-container-disabled");
    loadTimeSlots(date);

    // Disable step 2 next button until time is chosen
    dom.btnStep2Next.disabled = true;
}

// Helper to format date as YYYY-MM-DD in local time
function formatDateYYYYMMDD(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate Time Slots with real database availability
function loadTimeSlots(date) {
    dom.morningSlots.innerHTML = "";
    dom.afternoonSlots.innerHTML = "";

    // Add loading indicator inside slots
    const loadingText = document.createElement("p");
    loadingText.className = "slots-loading-text";
    loadingText.style.gridColumn = "1 / -1";
    loadingText.style.textAlign = "center";
    loadingText.style.color = "var(--color-text-muted)";
    loadingText.style.fontSize = "0.9rem";
    loadingText.style.padding = "10px";
    loadingText.textContent = "Cargando horarios disponibles...";

    dom.morningSlots.appendChild(loadingText.cloneNode(true));
    dom.afternoonSlots.appendChild(loadingText.cloneNode(true));

    const dateStr = formatDateYYYYMMDD(date);

    fetch(`/api/availability?date=${dateStr}`)
        .then(res => {
            if (!res.ok) throw new Error('Error fetching availability');
            return res.json();
        })
        .then(busySlots => {
            dom.morningSlots.innerHTML = "";
            dom.afternoonSlots.innerHTML = "";

            // Function to render grid
            const fillGrid = (slots, container, period) => {
                if (slots.length === 0) {
                    const noSlotsText = document.createElement("p");
                    noSlotsText.style.gridColumn = "1 / -1";
                    noSlotsText.style.color = "var(--color-text-muted)";
                    noSlotsText.style.fontSize = "0.9rem";
                    noSlotsText.textContent = "No hay horarios disponibles.";
                    container.appendChild(noSlotsText);
                    return;
                }

                slots.forEach((time, index) => {
                    const slotBtn = document.createElement("button");
                    slotBtn.className = "time-slot-btn";
                    slotBtn.textContent = time;

                    // Check if slot is busy based on database response
                    const isBusy = busySlots.includes(time);

                    // Also past slots of today must be disabled
                    const today = new Date();
                    const isToday = date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();

                    let isPast = false;
                    if (isToday) {
                        const [slotHour, slotMin] = time.split(":").map(Number);
                        const slotTimeToday = new Date().setHours(slotHour, slotMin, 0, 0);
                        if (slotTimeToday < new Date().getTime()) {
                            isPast = true;
                        }
                    }

                    if (isBusy || isPast) {
                        slotBtn.disabled = true;
                        slotBtn.classList.add("slot-busy");
                        slotBtn.innerHTML = `<span style="opacity: 0.4;">${time}</span>`;
                    } else {
                        if (bookingState.selectedTime === time) {
                            slotBtn.classList.add("selected");
                        }

                        slotBtn.addEventListener("click", () => selectTimeSlot(time, slotBtn));
                    }

                    container.appendChild(slotBtn);
                });
            };

            fillGrid(TIME_SLOTS.morning, dom.morningSlots, "morning");
            fillGrid(TIME_SLOTS.afternoon, dom.afternoonSlots, "afternoon");
        })
        .catch(err => {
            console.error('Error fetching availability:', err);
            dom.morningSlots.innerHTML = "<p style='color: var(--color-error); grid-column: 1/-1;'>Error al cargar horarios.</p>";
            dom.afternoonSlots.innerHTML = "";
        });
}

function selectTimeSlot(time, button) {
    bookingState.selectedTime = time;

    // Remove selected state from all slots
    document.querySelectorAll(".time-slot-btn").forEach(btn => {
        btn.classList.remove("selected");
    });

    // Add selected state
    button.classList.add("selected");

    // Enable step 2 next button
    dom.btnStep2Next.removeAttribute("disabled");
}

function updateDateAndTimeUI() {
    // If date is already selected, reload calendar and slots, else keep initial prompt
    if (bookingState.selectedDate) {
        handleDateSelection(bookingState.selectedDate);
        if (bookingState.selectedTime) {
            // Find and highlight time button
            document.querySelectorAll(".time-slot-btn").forEach(btn => {
                if (btn.textContent === bookingState.selectedTime && !btn.disabled) {
                    btn.classList.add("selected");
                    dom.btnStep2Next.removeAttribute("disabled");
                }
            });
        }
    } else {
        dom.selectedDateLabel.textContent = "Selecciona un día";
        dom.slotsContainer.classList.add("slots-container-disabled");
        dom.btnStep2Next.disabled = true;
    }
}

// --- Step 3: Client Details Form ---
function validateField(input, errorElement, type = 'text') {
    const parent = input.closest(".form-group");
    let isValid = true;

    if (type === 'phone') {
        // Basic phone validation: digits, spaces, hyphens, parenthesis and optional leading plus
        const val = input.value.trim();
        const phoneRegex = /^\+?[0-9\s\-()]{7,18}$/;
        isValid = val.length > 0 && phoneRegex.test(val);
    } else {
        isValid = input.value.trim().length > 0;
    }

    if (!isValid) {
        parent.classList.add("has-error");
        return false;
    } else {
        parent.classList.remove("has-error");
        return true;
    }
}

function handleStep3Submission() {
    const isNameValid = validateField(dom.custName, dom.errorCustName);
    const isPhoneValid = validateField(dom.custPhone, dom.errorCustPhone, 'phone');

    if (isNameValid && isPhoneValid) {
        bookingState.clientData.name = dom.custName.value.trim();
        bookingState.clientData.phone = dom.custPhone.value.trim();
        bookingState.clientData.notes = dom.custNotes.value.trim();
        goToStep(4);
    } else {
        // Focus first invalid element to trigger shake again
        if (!isNameValid) {
            dom.custName.focus();
        } else if (!isPhoneValid) {
            dom.custPhone.focus();
        }
    }
}

// --- Step 4: Summary Ticket ---
function populateSummaryTicket() {
    const service = bookingState.selectedService;
    const date = bookingState.selectedDate;
    const time = bookingState.selectedTime;
    const client = bookingState.clientData;

    if (!service || !date || !time) return;

    // Load Service details
    dom.sumServiceName.textContent = service.name;
    dom.sumServiceDuration.textContent = `${service.duration} min de duración aproximada`;
    dom.sumServicePrice.textContent = `$${service.price} USD`;
    dom.sumTotalPrice.textContent = `$${service.price} USD`;

    // Load Date details
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    dom.sumDatetime.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    dom.sumTime.textContent = `A las ${time} hs`;

    // Load Client Details
    dom.sumClientName.textContent = client.name;
    dom.sumClientPhone.textContent = client.phone;

    // Load Notes
    if (client.notes) {
        dom.sumNotesContainer.style.display = "flex";
        dom.sumClientNotes.textContent = client.notes;
    } else {
        dom.sumNotesContainer.style.display = "none";
    }
}

// --- WhatsApp Link Generation & Final Confirmation ---
function handleConfirmBooking() {
    const service = bookingState.selectedService;
    const date = bookingState.selectedDate;
    const time = bookingState.selectedTime;
    const client = bookingState.clientData;

    if (!service || !date || !time || !client.name || !client.phone) return;

    // Disable confirm button to prevent double bookings
    dom.btnConfirmBooking.disabled = true;
    const originalBtnText = dom.btnConfirmBooking.innerHTML;
    dom.btnConfirmBooking.innerHTML = `<span>Procesando...</span>`;

    // Format date elegantly for text: "Lunes, 22 de Junio de 2026"
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let formattedDate = date.toLocaleDateString('es-ES', options);
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const dateStr = formatDateYYYYMMDD(date);

    // Prepare API request payload
    const reservationData = {
        service_id: service.id,
        service_name: service.name,
        service_price: service.price,
        service_duration: service.duration,
        date: dateStr,
        time: time,
        client_name: client.name,
        client_phone: client.phone,
        client_notes: client.notes
    };

    // Save to SQLite database first
    fetch('/api/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
    })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error al guardar la reserva.');
            }
            return data;
        })
        .then(data => {
            // Create WhatsApp text message template using Unicode escape sequences for emojis and accents
            const textMessage = `\u00A1Hola! Me gustar\u00EDa agendar una cita. Aqu\u00ED est\u00E1n mis datos:
-  Servicio: ${service.name} ($${service.price} USD)
-  Fecha: ${formattedDate}
-  Hora: ${time} hs
-  Nombre: ${client.name}
-  Tel\u00E9fono: ${client.phone}
-  Notas: ${client.notes || 'Sin notas adicionales'}`;

            // URL Encode text message safely
            const encodedMessage = encodeURIComponent(textMessage);

            // Construct links
            const waMobileUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedMessage}`;
            const waFallbackUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

            // Show success modal overlay
            dom.successScreen.classList.add("active");
            dom.btnManualWhatsapp.href = waFallbackUrl;

            // Start confetti effect
            startConfetti();

            // Redirect after 2.5 seconds to give visual confirmation & let confetti play
            setTimeout(() => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const redirectUrl = isMobile ? waMobileUrl : waFallbackUrl;

                window.open(redirectUrl, '_blank');

                const dots = document.querySelector(".loader-dots");
                if (dots) dots.style.display = "none";
            }, 2500);
        })
        .catch(err => {
            // Restore button state
            dom.btnConfirmBooking.disabled = false;
            dom.btnConfirmBooking.innerHTML = originalBtnText;
            alert(`No se pudo completar la reserva: ${err.message}`);
        });
}

// --- Confetti Animation System (Pure Vanilla Canvas Canvas-Free Implementation) ---
let confettiAnimationId = null;

function startConfetti() {
    const canvas = dom.confettiCanvas;
    const ctx = canvas.getContext("2d");

    // Resize canvas
    const resizeCanvas = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = ["#B5838D", "#E5D3C3", "#E8C5C8", "#9E7682", "#67B380", "#E9D8A6"];
    const particleCount = 100;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 4 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            oscillationSpeed: Math.random() * 0.05 + 0.01,
            oscillationRange: Math.random() * 20 + 10,
            oscillationStep: Math.random() * 100
        });
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.y += p.speed;
            p.oscillationStep += p.oscillationSpeed;
            p.x += Math.sin(p.oscillationStep) * 0.5;
            p.rotation += p.rotationSpeed;

            // Draw particle
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();

            // Reset particles that fall off bottom
            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });

        confettiAnimationId = requestAnimationFrame(animate);
    };

    animate();

    // Stop after 7 seconds
    setTimeout(() => {
        if (confettiAnimationId) {
            cancelAnimationFrame(confettiAnimationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, 7000);
}
