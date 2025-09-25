document.addEventListener("DOMContentLoaded", () => {
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("reviews-container");

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No reviews available.</p>";
                return;
            }

            data.forEach(review => {
                const card = document.createElement("div");
                card.classList.add("review-card");

                card.innerHTML = `
                    <p class="review-header"><strong>${review.user}</strong> &#9733 ${review.rating.toFixed(1)} · ${review.date}</p>
                    <p class="review-text">${review.comment}</p>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => console.error("Error loading reviews:", error));
});
