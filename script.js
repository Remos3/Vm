document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // PLACEHOLDER CONSTANTS
    // Replace this with your actual WhatsApp Number
    // Format: Include country code, no + or spaces (e.g. 919876543210)
    // ==========================================
    const WHATSAPP_NUMBER = "YOUR_WHATSAPP_NUMBER"; 

    // --- 1. Navbar Scroll & Active State Logic (Optimized via requestAnimationFrame) ---
    const navbar = document.getElementById("navbar");
    const sections = document.querySelectorAll(".section-target");
    const navItemsArr = document.querySelectorAll(".nav-links .nav-item");
    let ticking = false;

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Sticky Toggle
                if (window.scrollY > 50) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }

                // Active Link Tracking
                let currentSectionId = "";
                sections.forEach(section => {
                    // 150px offset allows tab to change just before hitting the exact top
                    if (window.scrollY >= (section.offsetTop - 150)) { 
                        currentSectionId = section.getAttribute("id");
                    }
                });

                navItemsArr.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${currentSectionId}`) {
                        link.classList.add("active");
                    }
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });

    // --- 2. Mobile Navigation Toggle (Accessibility updated) ---
    const mobileMenuBtn = document.getElementById("mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    mobileMenuBtn.addEventListener("click", () => {
        const isActive = mobileMenuBtn.classList.toggle("active");
        navLinks.classList.toggle("active");
        mobileMenuBtn.setAttribute("aria-expanded", isActive);
    });

    // Close menu when clicking a link
    navItemsArr.forEach(item => {
        item.addEventListener("click", () => {
            if (navLinks.classList.contains("active")) {
                mobileMenuBtn.classList.remove("active");
                navLinks.classList.remove("active");
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            }
        });
    });

    // --- 3. Optimized Scroll Reveal via IntersectionObserver ---
    const scrollElements = document.querySelectorAll(".animate-on-scroll");

    if ('IntersectionObserver' in window) {
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.10 };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("scrolled-in");
                    observer.unobserve(entry.target); // Performance boost: stop observing once revealed
                }
            });
        }, observerOptions);

        scrollElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        scrollElements.forEach(el => el.classList.add("scrolled-in"));
    }

    // --- 4. Dynamic Year ---
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- 5. Portfolio Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || filterValue === category) {
                    item.classList.remove('hide');
                    // Force DOM reflow
                    setTimeout(() => { item.style.opacity = "1"; item.style.transform = "scale(1)"; }, 30);
                } else {
                    item.style.opacity = "0";
                    item.style.transform = "scale(0.8)";
                    setTimeout(() => { item.classList.add('hide'); }, 400); 
                }
            });
            updateLightboxArray();
        });
    });

    // --- 6. Lightbox Gallery Logic (Keyboard Accessible) ---
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const closeBtn = document.querySelector(".lightbox-close");
    const prevBtn = document.querySelector(".lightbox-prev");
    const nextBtn = document.querySelector(".lightbox-next");
    
    let currentImageIndex = 0;
    let visibleItems = [];

    function updateLightboxArray() {
        visibleItems = Array.from(portfolioItems).filter(item => !item.classList.contains('hide'));
    }
    updateLightboxArray();

    function openLightbox(item) {
        currentImageIndex = visibleItems.indexOf(item);
        showLightboxImage(currentImageIndex);
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden"; // Lock background scroll
        // Send focus to close button for screen readers
        setTimeout(() => closeBtn.focus(), 100);
    }

    // Attach click and enter-key events
    portfolioItems.forEach(item => {
        item.addEventListener("click", () => openLightbox(item));
        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter") openLightbox(item);
        });
    });

    function showLightboxImage(index) {
        if (visibleItems.length === 0) return;
        
        const item = visibleItems[index];
        const img = item.querySelector('img');
        const title = item.querySelector('h4').textContent;
        
        lightboxImg.style.opacity = 0;
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxCaption.textContent = title;
            lightboxImg.style.opacity = 1;
        }, 150);
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        document.body.style.overflow = "auto"; // Unlock scroll
    }

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox(); 
    });

    function changeImage(direction) {
        currentImageIndex += direction;
        if (currentImageIndex >= visibleItems.length) currentImageIndex = 0;
        else if (currentImageIndex < 0) currentImageIndex = visibleItems.length - 1;
        showLightboxImage(currentImageIndex);
    }

    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); changeImage(-1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); changeImage(1); });

    // Keyboard support for accessibility
    document.addEventListener("keydown", (e) => {
        if (lightbox.style.display === "flex") {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") changeImage(-1);
            if (e.key === "ArrowRight") changeImage(1);
        }
    });

    // --- 7. WhatsApp Form Submission ---
    const bookingForm = document.getElementById("booking-form");
    const successMsg = document.getElementById("form-success");

    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault(); 

            const name = document.getElementById("contact-name").value.trim();
            const phone = document.getElementById("contact-phone").value.trim();
            const email = document.getElementById("contact-email").value.trim();
            const eventType = document.getElementById("contact-event").value;
            const eventDate = document.getElementById("contact-date").value;
            const message = document.getElementById("contact-message").value.trim();

            if (!name || !phone || !eventType || !eventDate || !message) {
                alert("Please fill in all required fields.");
                return;
            }

            successMsg.classList.remove("hide");

            const waMessage = `*New Booking Enquiry*\n\n`
                            + `*Name:* ${name}\n`
                            + `*Phone:* ${phone}\n`
                            + `*Email:* ${email}\n`
                            + `*Event Type:* ${eventType}\n`
                            + `*Event Date:* ${eventDate}\n`
                            + `*Message:* ${message}\n\n`
                            + `_Sent from VM Video Solution Website_`;

            const encodedMessage = encodeURIComponent(waMessage);
            const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

            // Redirect to WhatsApp
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
                bookingForm.reset();
                setTimeout(() => successMsg.classList.add("hide"), 3000);
            }, 800);
        });
    }
});
