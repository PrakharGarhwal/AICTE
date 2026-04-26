// Load data from MongoDB on page load
async function loadRegistry() {
    try {
        const res = await fetch('/api/curriculum');
        const data = await res.json();
        console.log("Data received from DB:", data); // Check your browser console (F12) to see this
        
        const table = document.getElementById('curriculum-table');
        table.innerHTML = ''; 

        data.forEach(item => {
            table.innerHTML += `
                <tr id="${item._id}">
                    <td>${item.branch}</td>
                    <td>${item.code}</td>
                    <td>${item.revision || '2026.01'}</td>
                    <td><span class="status-badge">${item.status || 'Official'}</span></td>
                    <td><a href="${item.filePath || '#'}" download class="download-link">Syllabus</a></td>
                    <td class="admin-only" style="display:none;">
                        <button onclick="adminMiddleware('remove', '${item._id}')" class="btn-delete">Remove</button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Failed to load registry:", err);
    }
}

// Admin Middleware
async function adminMiddleware(action, data) {
    const els = {
        modal: document.getElementById('auth-modal'),
        panel: document.getElementById('admin-panel'),
        input: document.getElementById('pass-field'),
        error: document.getElementById('err'),
        nav: document.getElementById('nav-auth'),
        table: document.getElementById('curriculum-table'),
        adminOnly: document.querySelectorAll('.admin-only')
    };

    const run = {
        open: () => els.modal.style.display = 'flex',
        close: () => {
            els.modal.style.display = 'none';
            els.error.style.display = 'none';
            els.input.value = '';
        },
        verify: () => {
            // Updated to match your previous choice
            if (els.input.value === "incorrect") {
                els.modal.style.display = 'none';
                els.panel.style.display = 'block';
                els.nav.innerHTML = '<strong style="color:var(--usa-blue)">ADMIN MODE</strong>';
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'table-cell');
            } else {
                els.error.style.display = 'block';
            }
        },
   add: async () => {
            const fileInput = document.getElementById('new-file');
            const formData = new FormData();
            formData.append('branch', document.getElementById('new-branch').value);
            formData.append('code', document.getElementById('new-code').value);
            formData.append('revision', document.getElementById('new-rev').value);
            formData.append('status', document.getElementById('new-status').value);

            if (fileInput.files[0]) {
                formData.append('syllabusFile', fileInput.files[0]);
            }

            try {
                const response = await fetch('/api/curriculum', {
                    method: 'POST',
                    body: formData 
                });

                if (response.ok) {
                    alert("✅ Syllabus Updated Successfully!");
                } else {
                    // This handles the Render 502/Timeout
                    alert("⚠️ Data sent! It might take a second to appear in the list.");
                }
            } catch (err) {
                console.error("Connection Error:", err);
            }

            // Reset the form
            document.getElementById('new-branch').value = '';
            document.getElementById('new-code').value = '';
            fileInput.value = ''; 
            
            loadRegistry(); // Refresh the table
        }, 
        remove: async (data) => {
            if(confirm("Remove this course from Database?")) {
                await fetch(`/api/curriculum/${data}`, { method: 'DELETE' });
                loadRegistry();
            }
        }
    };

    if (run[action]) run[action](data);
}

// Trigger load on startup
window.onload = loadRegistry;
} // Refresh the table

        remove: async () => {
            if(confirm("Remove this course from Database?")) {
                await fetch(`/api/curriculum/${data}`, { method: 'DELETE' });
                document.getElementById(data).remove();
            }
        }
    };

    if (run[action]) run[action]();
}

// Trigger load on startup
window.onload = loadRegistry;
