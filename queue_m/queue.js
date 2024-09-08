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
    const currentname = document.getElementById('name').value;
    const currentcontact = document.getElementById('contact').value;

    if (!currentname || !currentcontact) {
        alert('Please provide both name and contact');
        return;
    }
    try {
        // Get the current name and contact from the input fields

        // Log the values for debugging
        console.log(currentname);
        console.log(currentcontact);

        // Send the POST request to generate a token
        const response = await fetch(`${API_URL}/generate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name1: currentname,   // Send as 'name1' according to the schema
                contact: currentcontact,
                department: selectedDepartment
            }) // Send the selected department, name, and contact
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
// async function fetchAndUpdateQueueCounts() {
//     console.log("function called");
//     try {
//         console.log("Triggered");
//         const response = await fetch(`${API_URL}/queue-counts`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         const data = await response.json();
//         // console.log(data);
//         // console.log(data.department);
//         // document.getElementById('queue-count-pediatric').textContent = ;
//         // document.getElementById('queue-count-physician').textContent = 50;
//         if (response.ok) {
//             console.log("response is ok");
//             // Update queue counts for each department dynamically
//             data.departmentqueue.forEach(department => {
//                 if (department.department === 'Pediatric') {
//                     document.getElementById('queue-count-pediatric').textContent = 13;
//                     // department.queueCount;
//                 } else if (department.department === 'Physician') {
//                     document.getElementById('queue-count-physician').textContent = 50;
//                     // department.queueCount;
//                 }
//             });
//         } else {
//             console.error('Error fetching queue counts:', data.message);
//         }
//     } catch (error) {
//         console.error('Error connecting to server:', error);
//     }
// }

// Function to fetch queue counts from the API
async function fetchQueueCounts() {
    try {
        // Fetch data from the API
        const response = await fetch(`${API_URL}/queue-counts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const departmentQueueCounts = await response.json();
        console.log(departmentQueueCounts);

        // Iterate over the received data and update the HTML
        departmentQueueCounts.forEach(department => {
            if (department.department === 'Pediatric') {
                console.log(1);
                document.getElementById('queue-count-pediatric').textContent = department.queueCount;
            } else if (department.department === 'Physician') {
                console.log(2);
                document.getElementById('queue-count-physician').textContent = department.queueCount;
            }
            // Add more conditions if you have additional departments
        });
    } catch (error) {
        console.error('Error fetching queue counts:', error);
    }
}

// Call the function to fetch and display the queue counts
fetchQueueCounts();


// Fetch queue counts initially and then every 60 seconds
// fetchAndUpdateQueueCounts();
setInterval(fetchQueueCounts, 60000); // 60 seconds interval
// Function to view the current queue
window.onload = fetchQueueCounts();
