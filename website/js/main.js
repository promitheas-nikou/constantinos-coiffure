/**
 * Constantinos Coiffure - Interactive Main JavaScript
 * Dynamic operations, store hours calculation, custom lightbox, navigation spy & modal forms
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Animate on Scroll (AOS) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            once: true,
            offset: 50
        });
    }

    /* ==========================================================================
       1. Sticky Header & Active Navigation Highlighting
       ========================================================================== */
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a');

    window.addEventListener('scroll', () => {
        // Sticky Header effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link Spy
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 150; // Offset for header height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       2. Mobile Menu Toggle
       ========================================================================== */
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('nav');
    const navItems = document.querySelectorAll('nav ul li a');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });

        // Close mobile nav when clicking a link
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.querySelector('i').className = 'fas fa-bars';
            });
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    }

    /* ==========================================================================
       3. Dynamic Store Status Indicator (Greek Hours)
       ========================================================================== */
    function checkStoreStatus() {
        const liveDot = document.getElementById('live-dot');
        const liveText = document.getElementById('live-text');
        
        if (!liveDot || !liveText) return;

        // Current Greece Time (approximate visitor local time)
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ... 6 = Saturday
        const hour = now.getHours();
        const minute = now.getMinutes();
        const totalMinutes = hour * 60 + minute;

        // Session hours in minutes
        // Shift 1: 09:00 to 13:00 (540 to 780 mins)
        // Shift 2: 15:30 to 20:00 (930 to 1200 mins)
        const shift1Start = 9 * 60;
        const shift1End = 13 * 60;
        const shift2Start = 15 * 60 + 30;
        const shift2End = 20 * 60;

        let isOpen = false;
        let statusMsg = '';

        // Working Days: Tuesday (2) to Saturday (6)
        if (day >= 2 && day <= 6) {
            const inShift1 = totalMinutes >= shift1Start && totalMinutes < shift1End;
            const inShift2 = totalMinutes >= shift2Start && totalMinutes < shift2End;
            
            if (inShift1 || inShift2) {
                isOpen = true;
            }
        }

        // Highlight current day in Contact section
        const daySelectorMap = {
            1: 'hours-mon', // Δευτέρα
            2: 'hours-tue', // Τρίτη
            3: 'hours-wed', // Τετάρτη
            4: 'hours-thu', // Πέμπτη
            5: 'hours-fri', // Παρασκευή
            6: 'hours-sat', // Σάββατο
            0: 'hours-sun'  // Κυριακή
        };
        const currentDayId = daySelectorMap[day];
        const dayElement = document.getElementById(currentDayId);
        if (dayElement) {
            dayElement.classList.add('active-day');
        }

        if (isOpen) {
            liveDot.className = 'live-dot pulsing';
            liveText.innerHTML = 'ΑΝΟΙΧΤΑ ΤΩΡΑ <span style="font-weight: 300;">| Περάστε να σας περιποιηθούμε!</span>';
        } else {
            liveDot.className = 'live-dot closed';
            
            // Determine next opening
            let nextDayText = '';
            if (day === 0 || day === 1) { // Sun or Mon
                nextDayText = 'Τρίτη στις 09:00';
            } else if (day >= 2 && day <= 6) {
                if (totalMinutes < shift1Start) {
                    nextDayText = 'σήμερα στις 09:00';
                } else if (totalMinutes >= shift1End && totalMinutes < shift2Start) {
                    nextDayText = 'σήμερα στις 15:30';
                } else {
                    // It's after closing
                    if (day === 6) { // Saturday night
                        nextDayText = 'Τρίτη στις 09:00';
                    } else {
                        nextDayText = 'αύριο στις 09:00';
                    }
                }
            }
            liveText.innerHTML = `ΚΛΕΙΣΤΑ ΤΩΡΑ <span style="font-weight: 300;">| Ανοίγουμε: ${nextDayText}</span>`;
        }
    }

    checkStoreStatus();
    // Update store status every minute
    setInterval(checkStoreStatus, 60000);

    /* ==========================================================================
       4. Services Price List Tabs Filtering
       ========================================================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const priceColumns = document.querySelectorAll('.pricing-column');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            priceColumns.forEach(column => {
                // If filter is 'all', show both columns, otherwise filter by ID
                if (filterValue === 'all') {
                    column.style.display = 'block';
                    // Trigger a quick fade-in-up layout animation
                    column.style.opacity = '0';
                    setTimeout(() => {
                        column.style.opacity = '1';
                        column.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    if (column.getAttribute('id') === filterValue) {
                        column.style.display = 'block';
                        column.style.opacity = '0';
                        setTimeout(() => {
                            column.style.opacity = '1';
                            column.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        column.style.display = 'none';
                    }
                }
            });
        });
    });

    /* ==========================================================================
       5. Custom Photo Gallery Lightbox Modal
       ========================================================================== */
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const lightboxTitle = lightbox ? lightbox.querySelector('.lightbox-caption h4') : null;
    const lightboxDesc = lightbox ? lightbox.querySelector('.lightbox-caption p') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;

    let currentGalleryIndex = 0;
    const galleryData = [];

    // Harvest details from gallery grid
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const h4 = item.querySelector('.gallery-overlay h4');
        const p = item.querySelector('.gallery-overlay p');
        
        galleryData.push({
            src: img.getAttribute('src'),
            title: h4 ? h4.innerText : '',
            desc: p ? p.innerText : ''
        });

        item.addEventListener('click', () => {
            currentGalleryIndex = index;
            openLightbox();
        });
    });

    function openLightbox() {
        if (!lightbox) return;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Enable scrolling
    }

    function updateLightboxContent() {
        if (!lightboxImg) return;
        const currentItem = galleryData[currentGalleryIndex];
        
        // Add smooth fade transition on change
        lightboxImg.style.opacity = '0.3';
        setTimeout(() => {
            lightboxImg.setAttribute('src', currentItem.src);
            if (lightboxTitle) lightboxTitle.innerText = currentItem.title;
            if (lightboxDesc) lightboxDesc.innerText = currentItem.desc;
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    function showNextImage() {
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
        updateLightboxContent();
    }

    function showPrevImage() {
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
        updateLightboxContent();
    }

    if (lightbox) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevImage();
        });
        // Click on background closes lightbox
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Key bindings
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        });
    }

    /* ==========================================================================
       6. Booking / Contact Modal System
       ========================================================================== */
    const bookingBtns = document.querySelectorAll('.trigger-booking-modal');
    const bookingModal = document.getElementById('booking-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const bookingForm = document.getElementById('appointment-form');
    const toast = document.getElementById('success-toast');

    function openBookingModal(e) {
        if (e) e.preventDefault();
        if (!bookingModal) return;
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeBookingModal() {
        if (!bookingModal) return;
        bookingModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    bookingBtns.forEach(btn => {
        btn.addEventListener('click', openBookingModal);
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeBookingModal);
    }

    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                closeBookingModal();
            }
        });
    }

    // Form Submission Handling
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect variables
            const name = document.getElementById('form-name').value;
            const phone = document.getElementById('form-phone').value;
            const service = document.getElementById('form-service').value;
            const date = document.getElementById('form-date').value;

            // Simple validation
            if (!name || !phone || !service || !date) {
                alert('Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία.');
                return;
            }

            // Change submit button state to simulating loading
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Αποστολή...';
            submitBtn.disabled = true;

            // Simulate server request delay
            setTimeout(() => {
                // Clear form
                bookingForm.reset();
                
                // Restore button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;

                // Close modal
                closeBookingModal();

                // Show dynamic Success Toast Notification
                if (toast) {
                    toast.classList.add('show');
                    // Automatically hide after 4 seconds
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 4000);
                }
            }, 1800);
        });
    }

    /* ==========================================================================
       7. Scroll to Top Button
       ========================================================================== */
    const scrollTopBtn = document.getElementById('scroll-top-btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('active');
        } else {
            scrollTopBtn.classList.remove('active');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ==========================================================================
       8. Smooth Anchor Scrolling with Adjustments for Sticky Header
       ========================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                const offset = 80; // height of fixed header approx
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetSection.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
