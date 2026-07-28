/**
 * Simple Name Display
 * Ensures name is displayed without any animations or character splitting
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the name element
    const nameElement = document.getElementById('name');
    
    // If the name element exists, ensure it's displayed properly
    if (nameElement) {
        // Make sure the original text is preserved (no character splitting)
        const originalText = nameElement.textContent || 'Kartavya Jharwal';
        
        // Remove any existing child elements that may have been created
        nameElement.innerHTML = originalText;
        
        // Apply direct styling to ensure visibility
        nameElement.style.opacity = '1';
        nameElement.style.color = '#ffffff';
        nameElement.style.visibility = 'visible';
        nameElement.style.display = 'block';
        
        // Remove any animation classes that might be present
        nameElement.classList.remove('typing-animation', 'char-animation', 'animated', 'animate');
    }
});
