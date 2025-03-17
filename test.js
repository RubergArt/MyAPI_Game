// Simple test script to verify JavaScript execution on GitHub Pages
console.log("JavaScript is running on GitHub Pages!");

// Create a message element when the page loads
window.onload = function() {
    // Create a new element to display a message
    const messageDiv = document.createElement('div');
    messageDiv.style.backgroundColor = '#4CAF50';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.margin = '20px auto';
    messageDiv.style.maxWidth = '600px';
    messageDiv.style.textAlign = 'center';
    messageDiv.textContent = 'JavaScript is running properly!';
    
    // Add it to the body
    document.body.appendChild(messageDiv);
    
    // Add a button to test interactivity
    const button = document.createElement('button');
    button.textContent = 'Click me!';
    button.style.padding = '10px 20px';
    button.style.margin = '10px';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.backgroundColor = '#2196F3';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    
    // Add click event
    button.addEventListener('click', function() {
        alert('Button clicked! JavaScript is working!');
    });
    
    // Add button to body
    document.body.appendChild(button);
}; 