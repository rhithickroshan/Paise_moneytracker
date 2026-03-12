/* ========================
   CORE DATA & AUTH MODULE
   ======================== */
const App = {
    data: {
        user: JSON.parse(localStorage.getItem('paise_user')) || null,
        transactions: JSON.parse(localStorage.getItem('paise_transactions')) || [],
        settings: JSON.parse(localStorage.getItem('paise_settings')) || { isPremium: false }
    },

    init() {
        // Daily Reminder Logic
        const today = new Date().toDateString();
        const lastRemind = localStorage.getItem('paise_last_reminder');
        if (lastRemind !== today && this.data.user) {
            alert("🔔 Don’t forget to log today’s expenses 💸");
            localStorage.setItem('paise_last_reminder', today);
        }
        
        // Weekly Summary Check
        this.checkWeeklySummary();
    },

    save() {
        localStorage.setItem('paise_user', JSON.stringify(this.data.user));
        localStorage.setItem('paise_transactions', JSON.stringify(this.data.transactions));
        localStorage.setItem('paise_settings', JSON.stringify(this.data.settings));
    },

    // Auth Helpers
    register(name, pin) {
        this.data.user = { name, pin, sessionActive: true };
        this.save();
        window.location.href = 'dashboard.html';
    },

    login(pin) {
        if (pin === this.data.user.pin) {
            this.data.user.sessionActive = true;
            this.save();
            window.location.href = 'dashboard.html';
        } else {
            alert('Incorrect PIN');
        }
    },

    logout() {
        if (this.data.user) {
            this.data.user.sessionActive = false;
            this.save();
        }
        window.location.href = 'lock.html';
    },

    addTransaction(transaction) {
        this.data.transactions.unshift(transaction); // Add to top
        this.save();
        return true;
    },

    getSummary() {
        let income = 0, expense = 0;
        this.data.transactions.forEach(t => {
            if (t.type === 'income') income += parseFloat(t.amount);
            else expense += parseFloat(t.amount);
        });
        return { income, expense, balance: income - expense };
    },

    checkWeeklySummary() {
        // Simplified Logic for demo: Check if today is Monday
        const d = new Date();
        if(d.getDay() === 1 && !sessionStorage.getItem('weekly_shown')) {
            const summary = this.getSummary(); // Real app would filter last 7 days
            // Just a visual cue for now
            console.log("Weekly Summary Calculated"); 
            sessionStorage.setItem('weekly_shown', 'true');
        }
    }
};

/* ========================
   UI HANDLERS
   ======================== */
// Handle Image Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// PDF Export (Premium)
function generatePDF() {
    if (!App.data.settings.isPremium) {
        const upgrade = confirm("💎 This is a Premium Feature. Unlock for Free (Demo)?");
        if(upgrade) {
            App.data.settings.isPremium = true;
            App.save();
            alert("Premium Unlocked! Try again.");
            location.reload();
        }
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const summary = App.getSummary();

    doc.setFontSize(22);
    doc.text("PAISE - Monthly Report", 20, 20);
    
    doc.setFontSize(16);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Income: +${summary.income}`, 20, 50);
    doc.text(`Total Expense: -${summary.expense}`, 20, 60);
    doc.text(`Net Balance: ${summary.balance}`, 20, 70);

    doc.setFontSize(12);
    doc.text("Recent Transactions:", 20, 90);
    
    let y = 100;
    App.data.transactions.slice(0, 10).forEach(t => {
        doc.text(`${t.date} | ${t.type.toUpperCase()} | ${t.amount} | ${t.category}`, 20, y);
        y += 10;
    });

    doc.save("paise-report.pdf");
}