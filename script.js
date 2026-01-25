// script.js - Complete JavaScript for PrintEase Website

// Smooth scrolling for navigation links
document.querySelectorAll('header nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation and submission handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Basic validation
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate form submission (replace with actual backend integration)
    console.log('Form submitted:', { name, email, message });
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    this.reset();
});

// Simple price calculator for printing services (demo)
function calculatePrice() {
    const bwPages = parseInt(document.getElementById('bwPages').value) || 0;
    const colorPages = parseInt(document.getElementById('colorPages').value) || 0;
    const plan = document.getElementById('plan').value;
    
    let bwRate, colorRate;
    if (plan === 'basic') {
        bwRate = 0.10;
        colorRate = 0.50;
    } else if (plan === 'premium') {
        bwRate = 0.08;
        colorRate = 0.40;
    } else {
        alert('Select a plan for calculation.');
        return;
    }
    
    const total = (bwPages * bwRate) + (colorPages * colorRate);
    document.getElementById('totalPrice').textContent = `Total: $${total.toFixed(2)}`;
}

// Add event listeners for price calculator (assuming we add HTML elements for it)
document.addEventListener('DOMContentLoaded', function() {
    // If you add a calculator section, uncomment and adjust
    // const calculateBtn = document.getElementById('calculateBtn');
    // if (calculateBtn) {
    //     calculateBtn.addEventListener('click', calculatePrice);
    // }
    
    // Add any other initialization here
});

// Service selection interactivity (highlight on click)
document.querySelectorAll('.service').forEach(service => {
    service.addEventListener('click', function() {
        // Remove highlight from others
        document.querySelectorAll('.service').forEach(s => s.classList.remove('selected'));
        // Add highlight to clicked
        this.classList.add('selected');
    });
});

// Add CSS for selected service (you can add this to style.css)
const style = document.createElement('style');
style.textContent = `
    .service.selected {
        border: 2px solid #3498db;
        background: #e8f4fd;
    }
`;
document.head.appendChild(style);

// Optional: Lazy load images or other performance enhancements
// (For now, placeholder image is used; replace with actual images)

// Error handling for missing elements
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.message);
});
