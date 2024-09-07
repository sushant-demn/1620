// script.js

// Function to be called when the "Book Now" button is clicked
function bookNow() {
    alert("Booking confirmed!");
}

// Add event listener to the "Book Now" button
document.addEventListener('DOMContentLoaded', (event) => {
    const bookButton = document.querySelector('button[type="button"]');
    bookButton.addEventListener('click', bookNow);
});