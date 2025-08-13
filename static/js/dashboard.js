// Dashboard JavaScript functionality

function initShiftsChart(data) {
    const ctx = document.getElementById('shiftsChart').getContext('2d');
    
    // Prepare data for Chart.js
    const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('ar-SA', { 
            month: 'short', 
            day: 'numeric' 
        });
    });
    
    const counts = data.map(item => item.count);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الورديات',
                data: counts,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    rtl: true,
                    textDirection: 'rtl'
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Auto-refresh dashboard data every 5 minutes
function refreshDashboard() {
    // In a real application, you might want to use AJAX to refresh data
    // For now, we'll just reload the page
    setTimeout(() => {
        if (document.visibilityState === 'visible') {
            window.location.reload();
        }
    }, 300000); // 5 minutes
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Add any additional dashboard initialization here
    console.log('Dashboard initialized');
    
    // Set up auto-refresh
    refreshDashboard();
    
    // Add click handlers for statistic cards
    const statCards = document.querySelectorAll('.card');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add subtle animation on click
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
});

// Utility function to format numbers in Arabic locale
function formatNumber(num) {
    return new Intl.NumberFormat('ar-SA').format(num);
}

// Utility function to format dates in Arabic
function formatArabicDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// Export dashboard data (if needed)
function exportDashboardData() {
    // This function could be extended to export dashboard summary
    console.log('Export functionality would be implemented here');
}
