document.addEventListener("DOMContentLoaded", () => {
    // Typing effect for the title
    const title = "WELCOME TO THE ULTIMATE ACRONYM RESOURCE";
    const titleElement = document.getElementById('title');
    let index1 = 0;

    function typeTitle() {
        if (index1 < title.length) {
            titleElement.textContent += title.charAt(index1);
            index1++;
            setTimeout(typeTitle, 50); // Adjust typing speed by changing the timeout value
        }
    }

    typeTitle();

    // Typing effect for the subtitle
    const subtitle = "Uncover the secrets of acronyms and abbreviations and don't hesitate to contribute to our database...";
    const subtitleElement = document.getElementById('subtitle');
    let index2 = 0;

    function typeSubtitle() {
        if (index2 < subtitle.length) {
            subtitleElement.textContent += subtitle.charAt(index2);
            index2++;
            setTimeout(typeSubtitle, 30); // Adjust typing speed by changing the timeout value
        }
    }

    typeSubtitle();

    // Event listener for the search button
    const button = document.getElementById('button');
    const resultDiv = document.getElementById('result');
    const resetButton = document.getElementById('resetButton');
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
                            // Prompt user to add to database
                            if (confirm('No match found for entered Acronym . \nDo you wish to add to the Database?')) {
                                const fullForm = prompt('Enter the full form of the acronym:');
                                if (fullForm) {
                                    // Send data to server for insertion
                                    return fetch(`http://localhost:3000/api/addAcronym`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ acronym: input, fullForm: fullForm })
                                    })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error(`Network response was not ok: ${response.statusText}`);
                                        }
                                        return response.json();
                                    })
                                    .then(result => {
                                        console.log('Acronym added successfully:', result);
                                        resultDiv.textContent = `Thank you for contributing to our Database :)`;
                                        resultDiv.innerHTML += `<br>Future visitors will be served with the following data:<br>
                                        ${result.acronym.toUpperCase()} stands for ${result.fullForm}`;
                                        resetButton.style.display = 'block'; // Show reset button
                                    })
                                    .catch(error => {
                                        console.error('Error adding acronym:', error);
                                        resultDiv.textContent = 'Error adding acronym. \nPlease read validation rules and try again.';
                                        resultDiv.innerHTML = resultDiv.innerHTML.replace(/\n/g, '<br>');
                                        resetButton.style.display = 'block'; // Show the reset button
                                    });
                                } else {
                                    resultDiv.textContent = 'Full form is required!';
                                }
                            } else {
                                console.log('User clicked cancel!'); // Log the user cancel action
                                cancelButton(); // Reset the page when user cancels adding to database
                            }
                        } else {
                            throw new Error(`Network response was not ok: ${response.statusText}`);
                        }
                    } else {
                        return response.json(); // Continue to the next .then if the response is OK
                    }
                })
                .then(data => {
                    if (data) {
                        console.log('Data received:', data); // Debug log
                        resultDiv.textContent = `${input.toUpperCase()} stands for ${data.fullForm}`;
                        resetButton.style.display = 'block'; // Show reset button
                    }
                })
                .catch(error => {
                    console.error('Fetch error:', error); // Debug log
                    resultDiv.textContent = 'Error fetching data';
                });
        } else {
            resultDiv.textContent = 'Acronym cannot be blank!';
        }
    });

    // Reset button functionality
    resetButton.addEventListener('click', () => {
        resetPage(); // Reset the page state
    });

    function resetPage() {
        resultDiv.textContent = ''; // Clear the result div content
        document.getElementById('input').value = ''; // Clear the input field
        resetButton.style.display = 'none'; // Hide the reset button
    }
    
    function cancelButton() {
        resultDiv.textContent = 'No match found in the Database!'; 
        document.getElementById('input').value = ''; 
        resetButton.style.display = 'block';
    }

    // Navigation functionality
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = event.target.getAttribute('href').substring(1);
            console.log('Navigating to:', target);

            // Hide all sections
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show the target section
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.style.display = 'block';
                if (target === 'acronym-list') {
                    currentPage = 1; // Reset to first page on navigation
                    fetchAcronyms(currentPage); // Fetch acronyms for the acronym list
                }
            } else {
                console.error('Section not found:', target);
            }
        });
    });

    // Acronym List Functionality
    let currentPage = 1;
    const itemsPerPage = 7;

    function fetchAcronyms(page) {
        fetch(`http://localhost:3000/api/acronyms?page=${page}&limit=${itemsPerPage}`)
            .then(response => response.json())
            .then(data => {
                displayAcronyms(data.acronyms);
                updatePagination(data.totalPages);
            })
            .catch(error => {
                console.error('Error fetching acronyms:', error);
            });
    }

    function displayAcronyms(acronyms) {
        const container = document.getElementById('acronymListContainer');
        container.innerHTML = '';
        const list = document.createElement('ul');
        acronyms.forEach(acronym => {
            const listItem = document.createElement('li');
            listItem.textContent = `${acronym.acronym}: ${acronym.fullForm}`;
            list.appendChild(listItem);
        });
        container.appendChild(list);
    }

    function updatePagination(totalPages) {
        document.getElementById('currentPage').textContent = currentPage;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    }

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchAcronyms(currentPage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        fetchAcronyms(currentPage);
    });

    // Add event listener for navigating to the acronym list
    const acronymListLink = document.querySelector('nav ul li a[href="#acronym-list"]');
    acronymListLink.addEventListener('click', (event) => {
        event.preventDefault();
        currentPage = 1; // Reset to first page on navigation
        fetchAcronyms(currentPage);
    });

    // Sorting functionality
    document.getElementById('sortAscBtn').addEventListener('click', () => {
        sortAcronyms('asc');
    });

    document.getElementById('sortDescBtn').addEventListener('click', () => {
        sortAcronyms('desc');
    });

    function sortAcronyms(order) {
        const listItems = document.querySelectorAll('#acronymListContainer ul li');
        const sortedItems = Array.from(listItems).sort((a, b) => {
            const textA = a.textContent.trim().toUpperCase();
            const textB = b.textContent.trim().toUpperCase();
            if (order === 'asc') {
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            } else {
                return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
            }
        });

        const ul = document.createElement('ul');
        sortedItems.forEach(item => ul.appendChild(item));
        document.getElementById('acronymListContainer').innerHTML = '';
        document.getElementById('acronymListContainer').appendChild(ul);
    }

    // Function to save search to localStorage
    function saveSearchToLocalStorage(search) {
        let searches = JSON.parse(localStorage.getItem('searches')) || [];
        searches.unshift(search); // Add new search to the beginning
        localStorage.setItem('searches', JSON.stringify(searches));
    }

    // Function to display recent searches
    function displayRecentSearches() {
        const dropdown = document.getElementById('recentSearchesDropdown');
        dropdown.innerHTML = ''; // Clear existing list

        let searches = JSON.parse(localStorage.getItem('searches')) || [];

        searches.slice(0, 7).forEach((search, index) => { // Display only last 7 searches
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${search}`;
            dropdown.appendChild(listItem);
        });
    }

    // Event listener for search button
    button.addEventListener('click', () => {
        const input = document.getElementById('input').value.trim();
        if (input) {
            saveSearchToLocalStorage(input); // Save search term
            displayRecentSearches(); // Update recent searches display
            // Remaining search functionality as per your requirement...
        }
    });

    // Initial display of recent searches on page load
    displayRecentSearches();

    // Toggle recent searches visibility
    const recentSearchesLink = document.getElementById('recentSearchesLink');
    recentSearchesLink.addEventListener('mouseover', () => {
        const dropdown = document.getElementById('recentSearchesDropdown');
        dropdown.classList.add('show'); // Add the 'show' class
    });

    recentSearchesLink.addEventListener('mouseout', () => {
        const dropdown = document.getElementById('recentSearchesDropdown');
        dropdown.classList.remove('show'); // Remove the 'show' class
    });

    // Close dropdown if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (!event.target.matches('#recentSearchesLink')) {
            const dropdown = document.getElementById('recentSearchesDropdown');
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });
      // Autocomplete functionality
      const inputField = document.getElementById('input');
      const suggestionsList = document.getElementById('autocomplete-list');
  
      inputField.addEventListener('input', async function() {
          const query = inputField.value.trim();
          if (query) {
              const suggestions = await fetchAutocompleteSuggestions(query);
              displaySuggestions(suggestions);
          } else {
              suggestionsList.style.display = 'none'; 
              suggestionsList.innerHTML = '';
          }
      });
  
      async function fetchAutocompleteSuggestions(query) {
          try {
              const response = await fetch(`http://localhost:3000/api/autocomplete/${query}`);
              if (response.ok) {
                  const data = await response.json();
                  return data.suggestions;
              } else {
                  console.error('Error fetching autocomplete suggestions:', response.statusText);
                  return [];
              }
          } catch (error) {
              console.error('Fetch error:', error);
              return [];
          }
      }
  
      function displaySuggestions(suggestions) {
          const suggestionsList = document.getElementById('suggestionItem'); // Corrected to match HTML id
      
          suggestionsList.innerHTML = ''; // Clear previous suggestions
      
          suggestions.forEach(suggestion => {
              const suggestionItem = document.createElement('div');
              suggestionItem.textContent = suggestion;
              suggestionItem.addEventListener('click', () => {
                  inputField.value = suggestion;
                  suggestionsList.innerHTML = ''; // Clear suggestions after selecting
              });
              suggestionsList.appendChild(suggestionItem);
          });
          suggestionsList.style.display = 'block'; // Show autocomplete list
      }
  });  