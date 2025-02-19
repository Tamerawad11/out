// تحميل البيانات من LocalStorage
let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let logs = JSON.parse(localStorage.getItem("logs")) || [];
let admin = localStorage.getItem("admin") || "مستخدم مجهول"; // تحميل اسم المسؤول مع قيمة افتراضية

// حفظ البيانات في LocalStorage
function saveData() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("logs", JSON.stringify(logs));
    localStorage.setItem("admin", admin); // ضمان حفظ اسم المسؤول
}

// ✅ تسجيل دخول المسؤول
function loginAdmin() {
    let adminName = document.getElementById("adminName").value.trim();
    if (adminName) {
        localStorage.setItem("admin", adminName);
        admin = adminName; // تحديث المتغير العام
        window.location.href = "home.html"; // الانتقال للصفحة الرئيسية
    }
}

// ✅ التأكد من تسجيل دخول المسؤول
function checkAdmin() {
    if (!admin || admin === "مستخدم مجهول") {
        window.location.href = "login.html"; // إعادة التوجيه لصفحة تسجيل الدخول
    }
}

// ✅ تحديث القوائم المنسدلة للقطع
function updateDropdowns() {
    let issueSelect = document.getElementById("issuePartName");
    let existingSelect = document.getElementById("existingParts");

    if (issueSelect) {
        issueSelect.innerHTML = inventory.map(p => `<option value="${p.name}">${p.name}</option>`).join("");
    }

    if (existingSelect) {
        existingSelect.innerHTML = inventory.map(p => `<option value="${p.name}">${p.name}</option>`).join("");
    }
}

// ✅ إضافة قطعة جديدة
function addPart() {
    checkAdmin();
    let name = document.getElementById("partName").value.trim();
    let quantity = parseInt(document.getElementById("quantity").value);
    let requester = document.getElementById("requesterName").value.trim();

    if (!name || isNaN(quantity) || quantity <= 0 || !requester) {
        alert("⚠️ الرجاء إدخال جميع البيانات.");
        return;
    }

    let part = inventory.find(p => p.name === name);
    if (part) {
        part.quantity += quantity;
    } else {
        inventory.push({ name, quantity });
    }

    logs.push({
        date: new Date().toLocaleString(),
        action: "إضافة",
        name,
        quantity,
        requester,
        admin
    });

    saveData();
    alert(`✅ تم إضافة ${quantity} من القطعة "${name}" بواسطة ${requester} (المسؤول: ${admin}).`);
    updateDropdowns();
}

// ✅ صرف قطعة
function removePart() {
    checkAdmin();
    let name = document.getElementById("issuePartName").value;
    let quantity = parseInt(document.getElementById("issueQuantity").value);
    let requester = document.getElementById("requesterName").value.trim();
    let part = inventory.find(p => p.name === name);

    if (!name || isNaN(quantity) || quantity <= 0 || !requester) {
        alert("⚠️ الرجاء إدخال جميع البيانات.");
        return;
    }

    if (part && part.quantity >= quantity) {
        part.quantity -= quantity;

        logs.push({
            date: new Date().toLocaleString(),
            action: "صرف",
            name,
            quantity: -quantity, // ✅ جعل الكمية سالبة عند الصرف
            requester,
            admin
        });

        saveData();
        alert(`✅ تم صرف ${quantity} من القطعة "${name}" بواسطة ${requester} (المسؤول: ${admin}).`);
        renderLog(); // ✅ تحديث السجل بعد الصرف
    } else {
        alert("⚠️ الكمية غير متوفرة بالمخزون!");
    }
}

// ✅ البحث عن قطعة
function searchPart() {
    let searchQuery = document.getElementById("searchInput").value.trim();
    let resultsTable = document.getElementById("searchResults");
    resultsTable.innerHTML = "";

    let results = inventory.filter(p => p.name.includes(searchQuery));
    results.forEach(p => {
        let lastRequester = logs.filter(l => l.name === p.name).slice(-1)[0]?.requester || "غير متاح";
        resultsTable.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>${lastRequester}</td>
            </tr>
        `;
    });

    if (results.length === 0) {
        resultsTable.innerHTML = `<tr><td colspan="3">لا توجد نتائج</td></tr>`;
    }
}

// ✅ عرض سجل العمليات مع تلوين صفوف الصرف
function renderLog() {
    let logTable = document.getElementById("logTable");
    logTable.innerHTML = "";

    logs.forEach(log => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${log.date}</td>
            <td>${log.action}</td>
            <td>${log.name}</td>
            <td>${log.quantity}</td>
            <td>${log.requester}</td>
            <td>${log.admin}</td>
        `;

        // ✅ تغيير لون الصف عند الصرف
        if (log.action === "صرف") {
            row.style.backgroundColor = "#fff3cd"; // لون أصفر فاتح
        }

        logTable.appendChild(row);
    });

    if (logs.length === 0) {
        logTable.innerHTML = `<tr><td colspan="6">لا توجد عمليات مسجلة</td></tr>`;
    }
}

// ✅ تحديث القوائم عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    admin = localStorage.getItem("admin") || "مستخدم مجهول"; 
    updateDropdowns();
    renderLog();
});
