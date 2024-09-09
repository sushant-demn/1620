const API_URL = 'http://localhost:5000'; // Change this to your backend URL
const currenttoken = null;
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
        // console.log(currentname);
        // console.log(currentcontact);

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
            currenttoken = data.token;
            alert(`Token generated for ${selectedDepartment}: ${data.token}`);
            fetchAndAppendData(currenttoken);
        } else {
            alert(`Error: ${data.message}`);
        }

    } catch (error) {
        alert('Error connecting to server');
    }
}


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
        // console.log(departmentQueueCounts);


        // Iterate over the received data and update the HTML
        departmentQueueCounts.forEach(department => {
            if (department.department === 'Pediatric'){
                // console.log(1);
                document.getElementById('queue-count-pediatric').textContent = department.queueCount;
                document.getElementById('queue-time-pediatric').textContent = ((department.queueCount)*10);
            } else if (department.department === 'Physician') {
                // console.log(2);
                document.getElementById('queue-count-physician').textContent = department.queueCount;
                document.getElementById('queue-time-physician').textContent = (department.queueCount*7);
            } else if (department.department === 'Cardiology') {
                // console.log(3);
                document.getElementById('queue-count-cardiology').textContent = department.queueCount;
                document.getElementById('queue-time-cardiology').textContent = ((department.queueCount)*15);
            } else if (department.department === 'Gynecology') {
                // console.log(4);
                document.getElementById('queue-count-gynecology').textContent = department.queueCount;
                document.getElementById('queue-time-gynecology').textContent = (department.queueCount*9);
            } else if (department.department === 'Orthopedics') {
                // console.log(5);
                document.getElementById('queue-count-orthopedics').textContent = department.queueCount;
                document.getElementById('queue-time-orthopedics').textContent = (department.queueCount*12);
            }
            // Add more conditions if you have additional departments
        });
    } catch (error) {
        console.error('Error fetching queue counts:', error);
    }
}


async function fetchAndAppendData(token) {
    console.log('Fetching data');
    try {
        // Send a POST request to the API with the token
        const response = await fetch(`${API_URL}/queue-position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        // Parse the JSON response
        const data = await response.json();
        console.log(data);

        if (response.ok) {
            // If the request was successful, append the data to the table
            appendToTable(data.name, data.department, data.position);
        } else {
            // Handle error responses
            console.error('Error:', data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

function appendToTable(name, department, position) {
    // Get the tbody element where the new rows will be added
    const tableBody = document.getElementById('Position');

    // Create a new row element
    const newRow = document.createElement('tr');

    // Create new cells for name, department, and position
    const nameCell = document.createElement('td');
    nameCell.textContent = name;

    const departmentCell = document.createElement('td');
    departmentCell.textContent = department;

    const positionCell = document.createElement('td');
    positionCell.textContent = position;

    // Append the cells to the new row
    newRow.appendChild(nameCell);
    newRow.appendChild(departmentCell);
    newRow.appendChild(positionCell);

    // Append the new row to the table body
    tableBody.appendChild(newRow);
}


// Call the function to fetch and display the queue counts
fetchQueueCounts();

// Fetch queue counts initially and then every 60 seconds

setInterval(fetchQueueCounts, 1000); // 60 seconds interval
// Function to view the current queue
window.onload = fetchQueueCounts(); 
