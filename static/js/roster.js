// Roster JavaScript functionality

let currentEmployees = {};

// Initialize roster functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Roster page initialized');
    
    // Store employee data for quick lookup
    const employeeSelects = document.querySelectorAll('#editEmployeeCode option');
    employeeSelects.forEach(option => {
        if (option.value) {
            currentEmployees[option.value] = option.textContent;
        }
    });
    
    // Add keyboard navigation
    setupKeyboardNavigation();
});

// Edit roster cell
function editRosterCell(cell, employeeCode, date, currentPeriod) {
    // Get employee name
    const employeeName = currentEmployees[employeeCode] || employeeCode;
    
    // Set modal values
    document.getElementById('rosterEmployeeCode').value = employeeCode;
    document.getElementById('rosterDate').value = date;
    document.getElementById('rosterEmployeeName').value = employeeName;
    document.getElementById('rosterDateDisplay').value = formatArabicDate(date);
    document.getElementById('rosterPeriod').value = currentPeriod || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editRosterModal'));
    modal.show();
    
    // Focus on period select when modal is shown
    document.getElementById('editRosterModal').addEventListener('shown.bs.modal', function() {
        document.getElementById('rosterPeriod').focus();
    }, { once: true });
}

// Format date in Arabic
function formatArabicDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    
    try {
        return date.toLocaleDateString('ar-SA', options);
    } catch (e) {
        // Fallback to English date if Arabic locale is not available
        return date.toLocaleDateString('en-US', options);
    }
}

// Setup keyboard navigation for roster table
function setupKeyboardNavigation() {
    const cells = document.querySelectorAll('.shift-cell');
    
    cells.forEach((cell, index) => {
        cell.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    cell.click();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigateToCell(index, 1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateToCell(index, -1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    navigateToCell(index, getDaysInMonth());
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    navigateToCell(index, -getDaysInMonth());
                    break;
            }
        });
        
        // Make cells focusable
        cell.setAttribute('tabindex', '0');
    });
}

// Navigate to adjacent cell
function navigateToCell(currentIndex, offset) {
    const cells = document.querySelectorAll('.shift-cell');
    const newIndex = currentIndex + offset;
    
    if (newIndex >= 0 && newIndex < cells.length) {
        cells[newIndex].focus();
    }
}

// Get number of days in current month
function getDaysInMonth() {
    // This should match the number of day columns in the table
    return document.querySelectorAll('thead th').length - 2; // Subtract employee name and total columns
}

// Quick period assignment shortcuts
function setupQuickShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('shift-cell')) {
            switch(e.key.toLowerCase()) {
                case 'd':
                    quickAssignPeriod(e.target, 'D');
                    break;
                case 'n':
                    quickAssignPeriod(e.target, 'N');
                    break;
                case 'f':
                    quickAssignPeriod(e.target, 'F');
                    break;
                case 'o':
                    quickAssignPeriod(e.target, 'O');
                    break;
                case 'Delete':
                case 'Backspace':
                    quickAssignPeriod(e.target, '');
                    break;
            }
        }
    });
}

// Quick assign period to cell
function quickAssignPeriod(cell, period) {
    const employeeCode = cell.dataset.employee;
    const date = cell.dataset.date;
    
    // Create and submit form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/roster/update';
    form.style.display = 'none';
    
    const fields = {
        'month': document.querySelector('input[name="month"]').value,
        'employee_code': employeeCode,
        'date': date,
        'period': period
    };
    
    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
}

// Bulk operations for roster
function bulkAssignPeriod(employeeCode, period) {
    const cells = document.querySelectorAll(`[data-employee="${employeeCode}"]`);
    cells.forEach(cell => {
        if (confirm(`تعيين "${period}" لجميع أيام الموظف ${employeeCode}؟`)) {
            quickAssignPeriod(cell, period);
        }
    });
}

// Print roster
function printRoster() {
    window.print();
}

// Export roster to CSV (client-side)
function exportRosterCSV() {
    const table = document.querySelector('.roster-table');
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        
        cols.forEach(col => {
            let text = col.textContent.trim();
            // Clean up badge text
            if (col.querySelector('.badge')) {
                text = col.querySelector('.badge').textContent.trim();
            }
            rowData.push(`"${text}"`);
        });
        
        csv.push(rowData.join(','));
    });
    
    // Create and download file
    const csvContent = '\uFEFF' + csv.join('\n'); // Add BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `roster_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize shortcuts after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupQuickShortcuts();
});

// Helper function to calculate working hours
function calculateTotalHours(employeeCode) {
    const cells = document.querySelectorAll(`[data-employee="${employeeCode}"] .badge`);
    let totalHours = 0;
    
    cells.forEach(badge => {
        const period = badge.textContent.trim();
        switch(period) {
            case 'D':
            case 'N':
                totalHours += 12;
                break;
            case 'F':
                totalHours += 24;
                break;
        }
    });
    
    return totalHours;
}

// Update total hours display (if needed for dynamic updates)
function updateTotalHours() {
    const employeeRows = document.querySelectorAll('[data-employee]');
    const uniqueEmployees = [...new Set(Array.from(employeeRows).map(row => row.dataset.employee))];
    
    uniqueEmployees.forEach(empCode => {
        const totalHours = calculateTotalHours(empCode);
        const totalCell = document.querySelector(`tr:has([data-employee="${empCode}"]) td:last-child`);
        if (totalCell) {
            totalCell.textContent = `${totalHours} ساعة`;
        }
    });
}
