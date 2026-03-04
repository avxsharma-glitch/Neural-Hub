// tilt.js - Handles 3D tilt perspective hover effects on cards

class TiltEffect {
    constructor(element) {
        this.element = element;
        this.card = element;

        // Add required CSS properties dynamically if not present
        this.element.style.transformStyle = "preserve-3d";

        this.bindEvents();
    }

    bindEvents() {
        this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.element.addEventListener('mouseleave', () => this.onMouseLeave());
        this.element.addEventListener('mouseenter', () => this.onMouseEnter());
    }

    onMouseMove(e) {
        const rect = this.element.getBoundingClientRect();

        // Calculate mouse position relative to the center of the card
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation based on cursor distance from center
        // Max rotation: 4deg (as requested)
        const moveX = (x - centerX);
        const moveY = (y - centerY);

        const rotateY = (moveX / centerX) * 4; // Rotate on Y axis based on mouse X
        const rotateX = -(moveY / centerY) * 4; // Rotate on X axis based on mouse Y

        this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    onMouseLeave() {
        // Reset transform with smooth transition
        this.element.style.transition = 'transform 0.5s ease';
        this.element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    }

    onMouseEnter() {
        // Remove transition to make movement instantly track mouse
        this.element.style.transition = 'transform 0.1s ease-out';
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => new TiltEffect(card));
});
