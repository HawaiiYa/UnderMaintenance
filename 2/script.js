document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.querySelector('.progress-bar');
    const statusText = document.querySelector('.status-text');

    const statusMessages = [
        "Initializing systems...",
        "Checking server health...",
        "Optimizing databases...",
        "Deploying updates...",
        "Finalizing setup...",
        "Almost there...",
        "Just a moment more..."
    ];

    let currentStatusIndex = 0;

    function updateStatusText() {
        statusText.style.opacity = 0;
        setTimeout(() => {
            currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
            statusText.textContent = statusMessages[currentStatusIndex];
            statusText.style.opacity = 1;
        }, 500); // Fade out/in duration
    }

    // Change status text every 2.5 seconds (matching 15s / 6 steps roughly)
    setInterval(updateStatusText, 2500);

    // Initial status
    statusText.textContent = statusMessages[0];

    // Add a little extra visual flair
    const container = document.querySelector('.container');
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = -y / 20; // Adjust divisor for sensitivity
        const rotateY = x / 20;  // Adjust divisor for sensitivity

        container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    container.addEventListener('mouseleave', () => {
        container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
});
