

const menuBtn = document.querySelector("#menuBtn");
const navlinks = document.querySelector("#navlinks");

menuBtn.addEventListener("click", () => {
    navlinks.classList.toggle("show");
});


gsap.registerPlugin(ScrollTrigger);

gsap.from(".navbar", {
    y: -60,
    opacity: 0,
    duration: 1
});
gsap.from(".hero-content > *", {
    x: -60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    clearProps: "all"
});

gsap.from(".hero-art", {
    scale: 0.7,
    opacity: 0,
    duration: 1.2,
    delay: 0.4
});

gsap.utils.toArray("h2, .filters, .featured, .writing-section, .newsletter").forEach(item => {
    gsap.from(item, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });
});

// Floating Image Animation
gsap.to(".hero-art", {
    y: -12,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});


