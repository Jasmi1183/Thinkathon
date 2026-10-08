/* =========================================================
   EMERGENCY PATIENT MANAGEMENT SYSTEM
   ========================================================= */


/* ================= DATA ================= */

let patients =
    JSON.parse(localStorage.getItem("emergencyPatients")) || [];

const TOTAL_BEDS = 12;


/* ================= NAVIGATION ================= */

function showSection(sectionId, button) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active-section");
        });

    document.getElementById(sectionId)
        .classList.add("active-section");


    document.querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });


    if (button) {
        button.classList.add("active");
    }


    updatePageTitle(sectionId);

    refreshAll();
}


function showSectionByName(sectionId) {

    const button =
        document.querySelector(
            `.nav-item[onclick*="'${sectionId}'"]`
        );

    showSection(sectionId, button);
}


function openRegistration() {

    showSectionByName("registration");

    const arrival =
        document.getElementById("arrivalTime");

    if (!arrival.value) {

        const now = new Date();

        arrival.value =
            now.toTimeString().slice(0, 5);
    }
}


function updatePageTitle(sectionId) {

    const titles = {

        dashboard: "Dashboard",

        registration:
            "Register Emergency Patient",

        patients:
            "Patient Management",

        priority:
            "Emergency Priority Queue",

        doctors:
            "Doctor Availability",

        beds:
            "Bed Status"

    };

    document.getElementById("pageTitle").textContent =
        titles[sectionId] || "Dashboard";
}


/* ================= STORAGE ================= */

function savePatients() {

    localStorage.setItem(
        "emergencyPatients",
        JSON.stringify(patients)
    );
}


/* ================= REGISTRATION ================= */

document
    .getElementById("patientForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const id =
            document.getElementById("patientId")
                .value.trim();


        const name =
            document.getElementById("patientName")
                .value.trim();


        /* Duplicate ID */

        if (
            patients.some(
                patient =>
                    patient.id.toLowerCase() ===
                    id.toLowerCase()
            )
        ) {

            showToast(
                "Duplicate ID",
                "Patient ID already exists.",
                "!"
            );

            return;
        }


        const patient = {

            id: id,

            name: name,

            age:
                document.getElementById("age").value,

            gender:
                document.getElementById("gender").value,

            phone:
                document.getElementById("phone").value,

            blood:
                document.getElementById("blood").value,

            emergency:
                document.getElementById("emergency").value,

            priority:
                document.getElementById("priority").value,

            symptom:
                document.getElementById("symptom").value,

            time:
                document.getElementById("arrivalTime").value,

            doctor:
                "Not Assigned",

            status:
                "Waiting"

        };


        patients.push(patient);

        savePatients();

        refreshAll();


        showToast(
            "Patient Registered",
            `${name} added to emergency queue.`,
            "✓"
        );


        document
            .getElementById("patientForm")
            .reset();


        setTimeout(() => {

            showSectionByName("dashboard");

        }, 700);

    });


/* ================= DOCTOR ASSIGNMENT ================= */

function assignDoctor(patient) {

    const emergency =
        patient.emergency.toLowerCase();


    if (
        emergency.includes("heart attack") ||
        emergency.includes("chest pain") ||
        emergency.includes("accident")
    ) {

        patient.doctor = "Dr. Kumar";

    }

    else if (
        emergency.includes("fracture") ||
        emergency.includes("injury")
    ) {

        patient.doctor = "Dr. Priya";

    }

    else {

        patient.doctor = "Dr. Arun";

    }
}


/* ================= PROCESS NEXT ================= */

function processNextPatient() {

    const waitingPatients =
        patients.filter(
            patient =>
                patient.status === "Waiting"
        );


    if (waitingPatients.length === 0) {

        showToast(
            "Queue Empty",
            "There are no waiting patients.",
            "!"
        );

        return;
    }


    const high =
        waitingPatients.find(
            patient =>
                patient.priority === "HIGH"
        );


    const medium =
        waitingPatients.find(
            patient =>
                patient.priority === "MEDIUM"
        );


    const low =
        waitingPatients.find(
            patient =>
                patient.priority === "LOW"
        );


    const next =
        high || medium || low;


    if (!next) return;


    assignDoctor(next);

    next.status = "Under Treatment";


    savePatients();

    refreshAll();


    showToast(
        "Patient Processing",
        `${next.name} assigned to ${next.doctor}.`,
        "⚕"
    );
}


/* ================= START TREATMENT ================= */

function startTreatment(id) {

    const patient =
        patients.find(
            patient => patient.id === id
        );


    if (!patient) return;


    if (patient.status === "Discharged") {

        showToast(
            "Invalid Action",
            "Discharged patient cannot be treated.",
            "!"
        );

        return;
    }


    assignDoctor(patient);

    patient.status = "Under Treatment";


    savePatients();

    refreshAll();


    showToast(
        "Treatment Started",
        `${patient.name} is now under treatment.`,
        "✓"
    );
}


/* ================= DISCHARGE ================= */

function dischargePatient(id) {

    const patient =
        patients.find(
            patient => patient.id === id
        );


    if (!patient) return;


    if (patient.status !== "Under Treatment") {

        showToast(
            "Cannot Discharge",
            "Patient is not currently under treatment.",
            "!"
        );

        return;
    }


    patient.status = "Discharged";


    savePatients();

    refreshAll();


    showToast(
        "Patient Discharged",
        `${patient.name} has been discharged.`,
        "✓"
    );
}


/* ================= PATIENT TABLE ================= */

function renderPatients() {

    const table =
        document.getElementById("patientTable");


    const search =
        document.getElementById("patientSearch")
            .value
            .toLowerCase();


    const filtered =
        patients.filter(patient =>

            patient.id
                .toLowerCase()
                .includes(search)

            ||

            patient.name
                .toLowerCase()
                .includes(search)

        );


    table.innerHTML = "";


    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;color:#777;padding:30px;">
                    No patients found
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(patient => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${patient.id}</strong>
            </td>

            <td>
                <strong>${patient.name}</strong>
                <small style="display:block;color:#777;">
                    ${patient.age} yrs • ${patient.gender}
                </small>
            </td>

            <td>
                ${patient.emergency}
            </td>

            <td>
                <span class="badge ${getPriorityClass(patient.priority)}">
                    ${patient.priority}
                </span>
            </td>

            <td>
                ${patient.doctor}
            </td>

            <td>
                <span class="${getStatusClass(patient.status)}">
                    ${patient.status}
                </span>
            </td>

            <td>

                ${
                    patient.status === "Waiting"

                    ?

                    `<button
                        class="small-btn"
                        onclick="startTreatment('${patient.id}')">
                        Start
                    </button>`

                    :

                    patient.status === "Under Treatment"

                    ?

                    `<button
                        class="small-btn"
                        onclick="dischargePatient('${patient.id}')">
                        Discharge
                    </button>`

                    :

                    `<span style="color:#38db88;">
                        ✓ Completed
                    </span>`
                }

            </td>
        `;


        table.appendChild(row);

    });

}


/* ================= PRIORITY QUEUE ================= */

function renderPriorityQueue() {

    renderOnePriority(
        "HIGH",
        "highQueue",
        "highCount"
    );

    renderOnePriority(
        "MEDIUM",
        "mediumQueue",
        "mediumCount"
    );

    renderOnePriority(
        "LOW",
        "lowQueue",
        "lowCount"
    );
}


function renderOnePriority(
    priority,
    containerId,
    countId
) {

    const container =
        document.getElementById(containerId);


    const list =
        patients.filter(
            patient =>
                patient.priority === priority &&
                patient.status === "Waiting"
        );


    document.getElementById(countId)
        .textContent = list.length;


    container.innerHTML = "";


    if (list.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No patients
            </div>
        `;

        return;
    }


    list.forEach(patient => {

        const item =
            document.createElement("div");


        item.className = "queue-item";


        item.innerHTML = `

            <div class="queue-left">

                <div class="queue-avatar">
                    👤
                </div>

                <div>

                    <strong>
                        ${patient.name}
                    </strong>

                    <small>
                        ${patient.id}
                        •
                        ${patient.emergency}
                    </small>

                </div>

            </div>

            <button
                class="small-btn"
                onclick="startTreatment('${patient.id}')">

                Start

            </button>
        `;


        container.appendChild(item);

    });
}


/* ================= DASHBOARD QUEUE ================= */

function renderDashboardQueue() {

    const container =
        document.getElementById(
            "dashboardQueue"
        );


    const waiting =
        patients
            .filter(
                patient =>
                    patient.status === "Waiting"
            )
            .sort(
                (a, b) =>
                    priorityValue(a.priority) -
                    priorityValue(b.priority)
            )
            .slice(0, 5);


    container.innerHTML = "";


    if (waiting.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No patients in emergency queue
            </div>
        `;

        return;
    }


    waiting.forEach(patient => {

        const item =
            document.createElement("div");


        item.className = "queue-item";


        item.innerHTML = `

            <div class="queue-left">

                <div class="queue-avatar">
                    👤
                </div>

                <div>

                    <strong>
                        ${patient.name}
                    </strong>

                    <small>
                        ${patient.emergency}
                    </small>

                </div>

            </div>

            <span class="badge
                ${getPriorityClass(patient.priority)}">

                ${patient.priority}

            </span>
        `;


        container.appendChild(item);

    });
}


/* ================= RECENT PATIENTS ================= */

function renderRecentPatients() {

    const table =
        document.getElementById(
            "recentPatientsTable"
        );


    const recent =
        [...patients]
            .reverse()
            .slice(0, 5);


    table.innerHTML = "";


    if (recent.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;color:#777;padding:25px;">
                    No patients registered yet
                </td>
            </tr>
        `;

        return;
    }


    recent.forEach(patient => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${patient.id}</td>

            <td>
                <strong>${patient.name}</strong>
            </td>

            <td>${patient.emergency}</td>

            <td>
                <span class="badge
                    ${getPriorityClass(patient.priority)}">

                    ${patient.priority}

                </span>
            </td>

            <td>
                <span class="${getStatusClass(patient.status)}">
                    ${patient.status}
                </span>
            </td>

        `;


        table.appendChild(row);

    });
}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const total =
        patients.length;


    const critical =
        patients.filter(
            patient =>
                patient.priority === "HIGH" &&
                patient.status !== "Discharged"
        ).length;


    const treatment =
        patients.filter(
            patient =>
                patient.status === "Under Treatment"
        ).length;


    const available =
        Math.max(
            TOTAL_BEDS - treatment,
            0
        );


    document.getElementById(
        "totalPatients"
    ).textContent = total;


    document.getElementById(
        "criticalPatients"
    ).textContent = critical;


    document.getElementById(
        "treatmentPatients"
    ).textContent = treatment;


    document.getElementById(
        "availableBeds"
    ).textContent = available;


    document.getElementById(
        "emergencyAvailable"
    ).textContent =
        Math.max(8 - treatment, 0);


    document.getElementById(
        "occupiedBeds"
    ).textContent =
        `${treatment} / ${TOTAL_BEDS}`;


    const percentage =
        (treatment / TOTAL_BEDS) * 100;


    document.getElementById(
        "bedProgress"
    ).style.width =
        `${percentage}%`;
}


/* ================= HELPERS ================= */

function priorityValue(priority) {

    if (priority === "HIGH") return 1;

    if (priority === "MEDIUM") return 2;

    return 3;
}


function getPriorityClass(priority) {

    if (priority === "HIGH")
        return "high-badge";

    if (priority === "MEDIUM")
        return "medium-badge";

    return "low-badge";
}


function getStatusClass(status) {

    if (status === "Waiting")
        return "waiting-badge";

    if (status === "Under Treatment")
        return "treatment-badge";

    return "discharged-badge";
}


/* ================= EMERGENCY ALERT ================= */

function triggerEmergencyAlert() {

    document
        .getElementById("emergencyModal")
        .classList.add("show");


    showToast(
        "Emergency Alert",
        "Emergency response protocol activated.",
        "🚨"
    );
}


function closeEmergencyModal() {

    document
        .getElementById("emergencyModal")
        .classList.remove("show");
}


/* ================= TOAST ================= */

function showToast(
    title,
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById("toast");


    document.getElementById(
        "toastTitle"
    ).textContent = title;


    document.getElementById(
        "toastMessage"
    ).textContent = message;


    document.getElementById(
        "toastIcon"
    ).textContent = icon;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


/* ================= REFRESH ================= */

function refreshAll() {

    renderPatients();

    renderPriorityQueue();

    renderDashboardQueue();

    renderRecentPatients();

    updateDashboard();
}


/* ================= INITIALIZE ================= */

function initializeApplication() {

    refreshAll();

    showSectionByName("dashboard");

}


initializeApplication();
