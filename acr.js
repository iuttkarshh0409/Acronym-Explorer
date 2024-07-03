document.addEventListener("DOMContentLoaded", () => {
    // Typing effect for the title
    const title = "Welcome to Acronym Explorer! :)";
    const titleElement = document.getElementById('title');
    let index1 = 0;

    function typeTitle() {
        if (index1 < title.length) {
            titleElement.textContent += title.charAt(index1);
            index1++;
            setTimeout(typeTitle, 150); // Adjust typing speed by changing the timeout value
        }
    }

    typeTitle();

    const subtitle = "Feel free to explore terminologies of your curriculum...";
    const subtitleElement = document.getElementById('subtitle');
    let index2 = 0;

    function typeSubtitle() {
        if (index2 < subtitle.length) {
            subtitleElement.textContent += subtitle.charAt(index2);
            index2++;
            setTimeout(typeSubtitle, 200); // Adjust typing speed by changing the timeout value
        }
    }

    typeSubtitle();

    // Event listener for the search button
    const button = document.getElementById('button');
    const resultDiv = document.getElementById('result');

    button.addEventListener('click', () => {
        const input = document.getElementById('input').value.trim();
        console.log('Input:', input); // Log the input
        if (input) {
            console.log('Fetching data for:', input); // Debug log
            fetch(`http://localhost:3000/api/acronym/${input}`)
                .then(response => {
                    console.log('Response status:', response.status); // Debug log
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error('Acronym not found');
                        } else {
                            throw new Error(`Network response was not ok: ${response.statusText}`);
                        }
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Data received:', data); // Debug log
                    resultDiv.textContent = data.fullForm;
                })
                .catch(error => {
                    console.error('Fetch error:', error); // Debug log
                    if (error.message === 'Acronym not found') {
                        resultDiv.textContent = 'Acronym not found';
                    } else {
                        resultDiv.textContent = 'Error fetching data';
                    }
                });
        } else {
            resultDiv.textContent = 'Please enter an acronym';
        }
    });
});
