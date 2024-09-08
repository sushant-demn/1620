const API_URL = 'http://localhost:5000';
// Function to generate a token and add a person to the queue
async function generateToken() {
    const name = document.getElementById('name').value;

    if (!name) {
        alert('Please enter your name');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/generate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();
        if (response.ok) {
            alert(`Token generated: ${data.token}`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Function to view the current queue
async function viewQueue() {
    try {
        const response = await fetch(`${API_URL}/queue`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            const queueList = document.getElementById('queueList');
            queueList.innerHTML = ''; // Clear the list
            data.queue.forEach(person => {
                const listItem = document.createElement('li');
                listItem.textContent = `${person.department} - Token: ${person.token}`;
                queueList.appendChild(listItem);
            });
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Function to check the position of a token in the queue
async function checkPosition() {
    const token = document.getElementById('token').value;

    if (!token) {
        alert('Please enter your token');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/queue-position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('positionResult').textContent = `Your position is: ${data.position}`;
            document.getElementById
        } else {
            document.getElementById('positionResult').textContent = `Error: ${data.message}`;
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}
