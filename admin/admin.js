const API_URL = 'http://localhost:5000';
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
            const tableBody = document.getElementById('queueTableBody');
            tableBody.innerHTML = ''; // Clear any existing rows

            // Iterate over the data and create table rows
            data.queue.forEach((person, index) => {
                const row = document.createElement('tr');

                // Create a cell for Sr. No
                const srNoCell = document.createElement('td');
                srNoCell.textContent = index + 1;
                row.appendChild(srNoCell);
                //create a cell for namecell
                const Namecell = document.createElement('td');
                Namecell.textContent = person.name1;
                row.appendChild(Namecell);
                // Create a cell for contact
                const contact = document.createElement('td');
                contact.textContent = person.contact;
                row.appendChild(contact);
                // Create a cell for Department
                const departmentCell = document.createElement('td');
                departmentCell.textContent = person.department;
                row.appendChild(departmentCell);

                // Create a cell for Delete button
                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Served';
                deleteButton.onclick = () => deleteRow(person.token);
                deleteCell.appendChild(deleteButton);
                row.appendChild(deleteCell);

                // Append the row to the table body
                tableBody.appendChild(row);
            });
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Function to delete a row based on the token
async function deleteRow(token) {
    try {
        const response = await fetch(`${API_URL}/queue/${token}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Remove the row from the UI
            viewQueue(); // Refresh the table to reflect the changes
            alert('Row deleted successfully');
        } else {
            const data = await response.json();
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Run the function every 60 seconds (60000 ms)
setInterval(viewQueue, 1000);

// Call the function immediately to load data on page load
window.onload = viewQueue;
