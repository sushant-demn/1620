const API_URL = 'http://localhost:5000'; // Change this to your backend URL

// async function VerfiyUser(){
//     const username = document.getElementById('name').value;
//     const password = document.getElementById('password').value;
//     if (!username || !password) {
//         alert('Please enter your username and password');
//         return;
//     }
//     try {
//         const response = await fetch(`${API_URL}/register`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ username, password })
//         });

//         const data = await response.json();
//         if (response.ok) {
//             alert(`Welcome ${username}`);
//         } else {
//             alert(`Error: ${data.message}`);
//         }
//     } catch (error) {
//         alert('Error connecting to server');
//     }

// }
// async function AddUser(){

//     const username = document.getElementById('name').value;
//     const password = document.getElementById('password').value;
//     if (!username || !password) {
//         alert('Please enter your username and password');
//         return;
//     }
//     try {
//         const response = await fetch(`${API_URL}/register`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ username, password })
//         });

//         const data = await response.json();
//         if (response.ok) {
//             alert(`Welcome ${username}`);
//         } else {
//             alert(`Error: ${data.message}`);
//         }
//     } catch (error) {
//         alert('Error connecting to server');
//     }

// }
// Function to generate a token and add a person to the queue
async function generateToken() {
    // Get all radio buttons with the name 'OPD'
    const radios = document.querySelectorAll('input[name="OPD"]');
    
    // Find the checked radio button
    let selectedDepartment = null;
    radios.forEach((radio) => {
        if (radio.checked) {
            selectedDepartment = radio.value;
        }
    });

    // Check if a department was selected
    if (!selectedDepartment) {
        alert('Please select a department');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/generate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ department: selectedDepartment }) // Send the selected department
        });

        const data = await response.json();
        if (response.ok) {
            alert(`Token generated for ${selectedDepartment}: ${data.token}`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Function to fetch queue counts and update the table
async function fetchAndUpdateQueueCounts() {
    try {
        const response = await fetch(`${API_URL}/queue-counts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            let i = 0
            data.departmentqueue.forEach(department => {
                // Find the table row corresponding to the department
                const row = document.querySelector(`input[value="${departmentqueue.department}"]`).closest('tr');
                const queueCell = row.querySelector('td:nth-child(2)');

                // Update the In_Queue column with the latest queue count
                queueCell.textContent = department.queueCount;
                console.log(i);
                i++;
            });
        } else {
            console.error('Error fetching queue counts:', data.message);
        }
    } catch (error) {
        console.error('Error connecting to server:', error);
    }
}

// Fetch queue counts initially and then every 60 seconds
fetchAndUpdateQueueCounts();
setInterval(fetchAndUpdateQueueCounts, 60000); // 60000ms = 1 minute

