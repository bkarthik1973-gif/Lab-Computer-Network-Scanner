/* =========================================================
   LAB NETWORK PORT SCANNER
   MSEC - FRONTEND APPLICATION
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

// DEMO MODE = true means the website works without backend.
// Later change to false after connecting your backend.

const DEMO_MODE = true;

// Spring Boot / Node backend can use this API base.
const API_BASE = "http://localhost:8080/api";


/* =========================================================
   COLLEGE DATA
========================================================= */

const departments = {

    CSE: {
        name: "Computer Science & Engineering",
        code: "CSE"
    },

    IT: {
        name: "Information Technology",
        code: "IT"
    },

    ECE: {
        name: "Electronics & Communication Engineering",
        code: "ECE"
    },

    EEE: {
        name: "Electrical & Electronics Engineering",
        code: "EEE"
    },

    CIVIL: {
        name: "Civil Engineering",
        code: "CIVIL"
    },

    MECHANICAL: {
        name: "Mechanical Engineering",
        code: "MECHANICAL"
    },

    ADS: {
        name: "Artificial Intelligence & Data Science",
        code: "ADS"
    }

};


/*
    Every department has its own laboratories.

    Lab 1 - Lab 6
    CC1 - CC3
*/

const laboratories = [
    "Lab 1",
    "Lab 2",
    "Lab 3",
    "Lab 4",
    "Lab 5",
    "Lab 6",
    "CC1",
    "CC2",
    "CC3"
];


/* =========================================================
   APPLICATION STATE
========================================================= */

let state = {

    department: localStorage.getItem("msecDepartment") || "IT",

    lab: localStorage.getItem("msecLab") || "Lab 1",

    currentPage: "dashboard",

    selectedDevice: null,

    scanRunning: false,

    scanTimer: null,

    progress: 0,

    devices: [],

    services: [],

    scans: [],

    settings: {

        network: "192.168.1.0/24",

        ports: "21,22,23,53,80,443,3389",

        timeout: 10,

        interval: 5,

        autoRefresh: true,

        scheduled: false,

        notifications: true,

        theme: "light"
    }

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeLogin();

    initializeNavigation();

    initializeSelectors();

    initializeDemoData();

    loadSettings();

    updateLaboratoryUI();

    renderAll();

    applyTheme();

    startAutoRefresh();

});


/* =========================================================
   LOGIN
========================================================= */

function initializeLogin() {

    const loggedIn =
        localStorage.getItem("msecLoggedIn");

    if (loggedIn === "true") {

        document
            .getElementById("loginPage")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("hidden");
    }


    document
        .getElementById("loginForm")
        .addEventListener("submit", function(e) {

            e.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value;

            /*
                Demo credentials:

                admin
                admin123

                Replace this with backend authentication later.
            */

            if (
                username === "admin" &&
                password === "admin123"
            ) {

                localStorage.setItem(
                    "msecLoggedIn",
                    "true"
                );

                document
                    .getElementById("loginPage")
                    .classList.add("hidden");

                document
                    .getElementById("app")
                    .classList.remove("hidden");

                showToast(
                    "Login successful. Welcome Administrator.",
                    "success"
                );

            } else {

                document
                    .getElementById("loginError")
                    .textContent =
                    "Invalid administrator ID or password.";

            }

        });

}


function togglePassword() {

    const password =
        document.getElementById("password");

    password.type =
        password.type === "password"
            ? "text"
            : "password";

}


function logout() {

    localStorage.removeItem("msecLoggedIn");

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

    showToast(
        "Logged out successfully.",
        "success"
    );
}


/* =========================================================
   DEPARTMENT & LAB SELECTORS
========================================================= */

function initializeSelectors() {

    const departmentSelect =
        document.getElementById("departmentSelect");

    const labSelect =
        document.getElementById("labSelect");

    const scanDepartment =
        document.getElementById("scanDepartment");

    const scanLab =
        document.getElementById("scanLab");


    departmentSelect.value =
        state.department;

    populateLabs(
        labSelect,
        state.lab
    );

    scanDepartment.value =
        state.department;

    populateLabs(
        scanLab,
        state.lab
    );


    departmentSelect.addEventListener(
        "change",
        function() {

            state.department =
                this.value;

            state.lab = "Lab 1";

            localStorage.setItem(
                "msecDepartment",
                state.department
            );

            localStorage.setItem(
                "msecLab",
                state.lab
            );

            populateLabs(
                labSelect,
                state.lab
            );

            scanDepartment.value =
                state.department;

            populateLabs(
                scanLab,
                state.lab
            );

            initializeDemoData();

            updateLaboratoryUI();

            renderAll();

            showToast(
                `${state.department} selected.`,
                "success"
            );

        }
    );


    labSelect.addEventListener(
        "change",
        function() {

            state.lab =
                this.value;

            localStorage.setItem(
                "msecLab",
                state.lab
            );

            scanLab.value =
                state.lab;

            updateLaboratoryUI();

            initializeDemoData();

            renderAll();

            showToast(
                `${state.lab} selected.`,
                "success"
            );

        }
    );


    scanDepartment.addEventListener(
        "change",
        function() {

            state.department =
                this.value;

            departmentSelect.value =
                state.department;

            state.lab = "Lab 1";

            populateLabs(
                scanLab,
                state.lab
            );

            populateLabs(
                labSelect,
                state.lab
            );

            initializeDemoData();

            updateLaboratoryUI();

            renderAll();

        }
    );


    scanLab.addEventListener(
        "change",
        function() {

            state.lab =
                this.value;

            labSelect.value =
                state.lab;

            localStorage.setItem(
                "msecLab",
                state.lab
            );

            updateLaboratoryUI();

            initializeDemoData();

            renderAll();

        }
    );

}


function populateLabs(select, selected) {

    select.innerHTML = laboratories
        .map(lab => {

            return `
                <option value="${lab}"
                    ${lab === selected ? "selected" : ""}>
                    ${lab}
                </option>
            `;

        })
        .join("");

}


/* =========================================================
   DEMO DATA
========================================================= */

function initializeDemoData() {

    state.devices = [];

    /*
        Every department/lab gets its own simulated
        40-computer environment.

        IP example:
        IT Lab 1 -> 192.168.1.x

        In real deployment the backend will return
        actual discovered devices.
    */

    const seed =
        getDepartmentSeed(state.department) +
        getLabSeed(state.lab);

    const subnet =
        10 + (seed % 10);


    for (let i = 1; i <= 40; i++) {

        const online = i <= 34;

        const ports = getDemoPorts(i);

        const services =
            ports
                .filter(p => p.status === "OPEN")
                .map(p => p.service);


        state.devices.push({

            deviceId:
                `${state.department}-${state.lab.replace(/\s/g, "")}-PC-${String(i).padStart(2,"0")}`,

            hostname:
                `PC-${String(i).padStart(2,"0")}`,

            ipAddress:
                `192.168.${subnet}.${100 + i}`,

            status:
                online ? "online" : "offline",

            openPorts:
                online
                    ? ports.filter(p => p.status === "OPEN").length
                    : 0,

            ports: online ? ports : [],

            services:
                online ? services : [],

            activeServices:
                online
                    ? Math.min(
                        services.length,
                        i % 3 === 0 ? 1 : 2
                    )
                    : 0,

            lastSeen:
                online
                    ? `${(i % 5) + 1} min ago`
                    : `${10 + i} min ago`,

            responseTime:
                online
                    ? `${8 + (i % 20)} ms`
                    : "—",

            department:
                state.department,

            lab:
                state.lab

        });

    }


    initializeServices();

    initializeScans();

}


/* =========================================================
   DEMO PORT DATA
========================================================= */

function getDemoPorts(index) {

    const patterns = [

        [
            {
                port: 22,
                protocol: "TCP",
                service: "SSH",
                status: "OPEN"
            },
            {
                port: 80,
                protocol: "TCP",
                service: "HTTP",
                status: "OPEN"
            },
            {
                port: 443,
                protocol: "TCP",
                service: "HTTPS",
                status: "OPEN"
            },
            {
                port: 3389,
                protocol: "TCP",
                service: "RDP",
                status: "CLOSED"
            }
        ],

        [
            {
                port: 80,
                protocol: "TCP",
                service: "HTTP",
                status: "OPEN"
            },
            {
                port: 443,
                protocol: "TCP",
                service: "HTTPS",
                status: "OPEN"
            },
            {
                port: 22,
                protocol: "TCP",
                service: "SSH",
                status: "CLOSED"
            }
        ],

        [
            {
                port: 21,
                protocol: "TCP",
                service: "FTP",
                status: "OPEN"
            },
            {
                port: 80,
                protocol: "TCP",
                service: "HTTP",
                status: "OPEN"
            },
            {
                port: 443,
                protocol: "TCP",
                service: "HTTPS",
                status: "CLOSED"
            }
        ],

        [
            {
                port: 53,
                protocol: "UDP",
                service: "DNS",
                status: "OPEN"
            },
            {
                port: 80,
                protocol: "TCP",
                service: "HTTP",
                status: "OPEN"
            },
            {
                port: 3389,
                protocol: "TCP",
                service: "RDP",
                status: "OPEN"
            }
        ]

    ];

    return patterns[index % patterns.length];

}


/* =========================================================
   SERVICES
========================================================= */

function initializeServices() {

    state.services = [

        {
            id: "svc-http",
            serviceName: "HTTP",
            port: 80,
            protocol: "TCP",
            monitoringEnabled: true,
            status: "Available"
        },

        {
            id: "svc-https",
            serviceName: "HTTPS",
            port: 443,
            protocol: "TCP",
            monitoringEnabled: true,
            status: "Available"
        },

        {
            id: "svc-ssh",
            serviceName: "SSH",
            port: 22,
            protocol: "TCP",
            monitoringEnabled: true,
            status: "Unavailable"
        },

        {
            id: "svc-ftp",
            serviceName: "FTP",
            port: 21,
            protocol: "TCP",
            monitoringEnabled: true,
            status: "Available"
        },

        {
            id: "svc-rdp",
            serviceName: "RDP",
            port: 3389,
            protocol: "TCP",
            monitoringEnabled: true,
            status: "Available"
        },

        {
            id: "svc-dns",
            serviceName: "DNS",
            port: 53,
            protocol: "UDP",
            monitoringEnabled: true,
            status: "Available"
        },

        {
            id: "svc-telnet",
            serviceName: "Telnet",
            port: 23,
            protocol: "TCP",
            monitoringEnabled: false,
            status: "Unavailable"
        }

    ];

}


/* =========================================================
   SCAN HISTORY
========================================================= */

function initializeScans() {

    state.scans = [

        {
            id: "SCAN-003",
            network:
                `192.168.${10 + (getDepartmentSeed(state.department) % 10)}.0/24`,
            date: "08 Sep 2026, 14:05",
            duration: "12 sec",
            devices: 40,
            openPorts: 72,
            status: "Completed"
        },

        {
            id: "SCAN-002",
            network:
                `192.168.${10 + (getDepartmentSeed(state.department) % 10)}.0/24`,
            date: "08 Sep 2026, 13:30",
            duration: "11 sec",
            devices: 39,
            openPorts: 68,
            status: "Completed"
        },

        {
            id: "SCAN-001",
            network:
                `192.168.${10 + (getDepartmentSeed(state.department) % 10)}.0/24`,
            date: "08 Sep 2026, 12:55",
            duration: "12 sec",
            devices: 38,
            openPorts: 67,
            status: "Completed"
        }

    ];

}


/* =========================================================
   HELPERS
========================================================= */

function getDepartmentSeed(department) {

    const values = {
        CSE: 1,
        IT: 2,
        ECE: 3,
        EEE: 4,
        CIVIL: 5,
        MECHANICAL: 6,
        ADS: 7
    };

    return values[department] || 2;

}


function getLabSeed(lab) {

    const index =
        laboratories.indexOf(lab);

    return index >= 0 ? index + 1 : 1;

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateLaboratoryUI() {

    const dept =
        state.department;

    const lab =
        state.lab;


    document
        .getElementById("headerDepartment")
        .textContent = dept;

    document
        .getElementById("headerLab")
        .textContent = lab;


    document
        .getElementById("dashboardLab")
        .textContent =
        `${dept} - ${lab}`;


    document
        .getElementById("deviceDepartmentTitle")
        .textContent = dept;

    document
        .getElementById("deviceLabTitle")
        .textContent = lab;


    document
        .getElementById("networkDepartment")
        .textContent = dept;

    document
        .getElementById("networkLab")
        .textContent = lab;


    document
        .getElementById("detailDepartment")
        .textContent = dept;

    document
        .getElementById("detailLab")
        .textContent = lab;

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.page
                    );

                }
            );

        });

}


function showPage(page) {

    state.currentPage =
        page;


    document
        .querySelectorAll(".page")
        .forEach(p => {

            p.classList.remove(
                "active-page"
            );

        });


    const selected =
        document.getElementById(
            `page-${page}`
        );


    if (selected) {

        selected.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                btn.dataset.page === page
            );

        });


    if (page === "dashboard")
        renderDashboard();

    if (page === "devices")
        renderDevices();

    if (page === "services")
        renderServices();

    if (page === "network")
        renderNetwork();

    if (page === "history")
        renderHistory();

    if (page === "settings")
        renderSettings();


    document
        .getElementById("sidebar")
        .classList.remove("show");

}


function goToScan() {

    showPage("scan");

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderAll() {

    renderDashboard();

    renderDevices();

    renderServices();

    renderNetwork();

    renderHistory();

    renderSettings();

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const total =
        state.devices.length;

    const online =
        state.devices.filter(
            d => d.status === "online"
        ).length;

    const offline =
        state.devices.filter(
            d => d.status === "offline"
        ).length;

    const openPorts =
        state.devices.reduce(
            (sum, d) =>
                sum + d.openPorts,
            0
        );

    const activeServices =
        state.devices.reduce(
            (sum, d) =>
                sum + d.activeServices,
            0
        );


    setText(
        "totalDevices",
        total
    );

    setText(
        "onlineDevices",
        online
    );

    setText(
        "offlineDevices",
        offline
    );

    setText(
        "openPorts",
        openPorts
    );

    setText(
        "activeServices",
        activeServices
    );


    const percentage =
        total
            ? Math.round(
                online / total * 100
            )
            : 0;


    const donut =
        document.getElementById(
            "deviceDonut"
        );


    donut.style.background =
        `conic-gradient(
            var(--green) 0 ${percentage}%,
            #e2e8f0 ${percentage}% 100%
        )`;


    donut.querySelector("strong")
        .textContent =
        `${percentage}%`;


    setText(
        "onlineLegend",
        online
    );

    setText(
        "offlineLegend",
        offline
    );


    renderServiceChart();

    renderRecentScans();

    renderDashboardDevices();

}


/* =========================================================
   SERVICE CHART
========================================================= */

function renderServiceChart() {

    const chart =
        document.getElementById(
            "serviceChart"
        );


    const services = [
        {
            name: "HTTP",
            value: 82
        },
        {
            name: "HTTPS",
            value: 75
        },
        {
            name: "SSH",
            value: 61
        },
        {
            name: "FTP",
            value: 48
        },
        {
            name: "RDP",
            value: 69
        },
        {
            name: "Other",
            value: 38
        }
    ];


    chart.innerHTML =
        services.map(service => {

            return `
                <div class="bar-row">

                    <span>${service.name}</span>

                    <div class="bar-track">
                        <div
                            class="bar-fill"
                            style="width:${service.value}%"
                        ></div>
                    </div>

                    <b>${service.value}%</b>

                </div>
            `;

        }).join("");

}


/* =========================================================
   DASHBOARD DEVICES
========================================================= */

function renderDashboardDevices() {

    const table =
        document.getElementById(
            "dashboardDeviceTable"
        );


    const devices =
        state.devices.slice(0, 6);


    table.innerHTML =
        devices.map(
            createDeviceRow
        ).join("");

}


/* =========================================================
   DEVICE TABLE
========================================================= */

function renderDevices() {

    const table =
        document.getElementById(
            "devicesTable"
        );


    if (!table)
        return;


    const search =
        (
            document
                .getElementById("deviceSearch")
                ?.value || ""
        ).toLowerCase();


    const status =
        document
            .getElementById("statusFilter")
            ?.value || "all";


    const service =
        document
            .getElementById("serviceFilter")
            ?.value || "all";


    const sort =
        document
            .getElementById("sortFilter")
            ?.value || "ip";


    let devices =
        [...state.devices];


    devices =
        devices.filter(device => {

            const matchesSearch =
                device.hostname
                    .toLowerCase()
                    .includes(search) ||

                device.ipAddress
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "all" ||
                device.status === status;


            const matchesService =
                service === "all" ||
                device.services.includes(service);


            return (
                matchesSearch &&
                matchesStatus &&
                matchesService
            );

        });


    devices.sort(
        (a,b) => {

            if (sort === "name")
                return a.hostname
                    .localeCompare(b.hostname);

            if (sort === "status")
                return a.status
                    .localeCompare(b.status);

            if (sort === "ports")
                return b.openPorts -
                    a.openPorts;

            return a.ipAddress
                .localeCompare(
                    b.ipAddress,
                    undefined,
                    { numeric: true }
                );

        }
    );


    table.innerHTML =
        devices.map(
            createDeviceRow
        ).join("");


    if (!devices.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:40px">
                    No devices found.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   DEVICE ROW
========================================================= */

function createDeviceRow(device) {

    const statusClass =
        device.status;


    const statusText =
        device.status.toUpperCase();


    const ports =
        device.openPorts
            ? device.ports
                .filter(p =>
                    p.status === "OPEN"
                )
                .map(
                    p =>
                    `<span class="port-pill">${p.port}</span>`
                )
                .join("")
            : "—";


    const services =
        device.services.length
            ? device.services.join(", ")
            : "—";


    return `

        <tr>

            <td>

                <div class="device-cell">

                    <div class="pc-icon">🖥</div>

                    <div>

                        <strong>
                            ${device.hostname}
                        </strong>

                        <small>
                            ${device.department}
                            ·
                            ${device.lab}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${device.ipAddress}
            </td>


            <td>

                <span
                    class="status ${statusClass}"
                >
                    ● ${statusText}
                </span>

            </td>


            <td>

                <div class="port-pills">
                    ${ports}
                </div>

            </td>


            <td>
                <span class="service-list">
                    ${services}
                </span>
            </td>


            <td>
                ${device.lastSeen}
            </td>


            <td>

                <button
                    class="action-btn"
                    onclick="openDeviceDetails('${device.deviceId}')"
                >
                    VIEW
                </button>

            </td>

        </tr>
    `;

}


/* =========================================================
   DEVICE DETAILS
========================================================= */

function openDeviceDetails(id) {

    const device =
        state.devices.find(
            d => d.deviceId === id
        );


    if (!device)
        return;


    state.selectedDevice =
        device;


    setText(
        "detailDeviceName",
        device.hostname
    );

    setText(
        "detailDeviceSubtitle",
        `${device.ipAddress} · ${device.department} · ${device.lab}`
    );

    setText(
        "detailName",
        device.hostname
    );

    setText(
        "detailIP",
        device.ipAddress
    );

    setText(
        "detailDepartment",
        device.department
    );

    setText(
        "detailLab",
        device.lab
    );

    setText(
        "detailLastSeen",
        device.lastSeen
    );

    setText(
        "detailResponse",
        device.responseTime
    );


    const status =
        document.getElementById(
            "detailStatus"
        );


    status.className =
        `status ${device.status}`;


    status.textContent =
        `● ${device.status.toUpperCase()}`;


    const openCount =
        device.ports.filter(
            p => p.status === "OPEN"
        ).length;


    setText(
        "detailOpenPortCount",
        `${openCount} OPEN`
    );


    const portsTable =
        document.getElementById(
            "detailPortsTable"
        );


    portsTable.innerHTML =
        device.ports.length
            ? device.ports.map(port => {

                return `
                    <tr>

                        <td>
                            <strong>
                                ${port.port}
                            </strong>
                        </td>

                        <td>
                            ${port.protocol}
                        </td>

                        <td>
                            ${port.service}
                        </td>

                        <td>

                            <span
                                class="status
                                ${
                                    port.status === "OPEN"
                                    ? "online"
                                    : "offline"
                                }"
                            >
                                ● ${port.status}
                            </span>

                        </td>

                    </tr>
                `;

            }).join("")
            : `
                <tr>
                    <td colspan="4"
                        style="text-align:center">
                        No port data available.
                    </td>
                </tr>
            `;


    renderDeviceHistory(device);


    showPage("device-details");

}


/* =========================================================
   DEVICE HISTORY
========================================================= */

function renderDeviceHistory(device) {

    const container =
        document.getElementById(
            "deviceHistory"
        );


    container.innerHTML = `

        <div class="history-card">

            <strong>Latest Scan</strong>

            <span>
                Status:
                ${device.status.toUpperCase()}
            </span>

            <br>

            <span>
                Response:
                ${device.responseTime}
            </span>

        </div>


        <div class="history-card">

            <strong>Open Ports</strong>

            <span>
                ${device.openPorts}
                ports detected
            </span>

            <br>

            <span>
                Services:
                ${device.services.join(", ") || "None"}
            </span>

        </div>


        <div class="history-card">

            <strong>Last Seen</strong>

            <span>
                ${device.lastSeen}
            </span>

            <br>

            <span>
                Laboratory:
                ${device.lab}
            </span>

        </div>

    `;

}


function scanSelectedDevice() {

    if (!state.selectedDevice)
        return;


    scanIndividualDevice(
        state.selectedDevice
    );

}


/* =========================================================
   INDIVIDUAL DEVICE SCAN
========================================================= */

function scanIndividualDevice(device) {

    showToast(
        `Scanning ${device.hostname}...`,
        "success"
    );


    setTimeout(() => {

        device.status =
            Math.random() > .12
                ? "online"
                : "offline";


        if (device.status === "online") {

            device.lastSeen =
                "Just now";

            device.responseTime =
                `${5 + Math.floor(
                    Math.random() * 20
                )} ms`;

        }


        renderAll();


        if (
            state.currentPage ===
            "device-details"
        ) {

            openDeviceDetails(
                device.deviceId
            );

        }


        showToast(
            `${device.hostname} scan completed.`,
            "success"
        );

    }, 1300);

}


/* =========================================================
   SERVICES PAGE
========================================================= */

function renderServices() {

    renderServiceCards();

    renderServiceTable();

}


function renderServiceCards() {

    const container =
        document.getElementById(
            "serviceCards"
        );


    container.innerHTML =
        state.services.map(service => {

            return `

                <div class="service-card">

                    <div class="service-card-icon">
                        ⚙
                    </div>

                    <h3>
                        ${service.serviceName}
                    </h3>

                    <p>
                        Port ${service.port}
                        · ${service.protocol}
                    </p>

                    <div class="service-status">

                        <span
                            class="${
                                service.status === "Available"
                                ? "available"
                                : "unavailable"
                            }"
                        >
                            ● ${service.status}
                        </span>

                        <span class="monitoring">
                            ${
                                service.monitoringEnabled
                                ? "MONITORING ON"
                                : "DISABLED"
                            }
                        </span>

                    </div>

                </div>

            `;

        }).join("");

}


function renderServiceTable() {

    const table =
        document.getElementById(
            "serviceTable"
        );


    table.innerHTML =
        state.services.map(service => {

            return `

                <tr>

                    <td>
                        <strong>
                            ${service.serviceName}
                        </strong>
                    </td>

                    <td>
                        ${service.port}
                    </td>

                    <td>
                        ${service.protocol}
                    </td>

                    <td>

                        <label class="switch">

                            <input
                                type="checkbox"
                                ${
                                    service.monitoringEnabled
                                    ? "checked"
                                    : ""
                                }

                                onchange="
                                    toggleService(
                                        '${service.id}'
                                    )
                                "
                            >

                            <span></span>

                        </label>

                    </td>

                    <td>

                        <span
                            class="${
                                service.status === "Available"
                                ? "available"
                                : "unavailable"
                            }"
                        >
                            ● ${service.status}
                        </span>

                    </td>

                    <td>

                        <button
                            class="small-action"
                            onclick="
                                removeService(
                                    '${service.id}'
                                )
                            "
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   ADD SERVICE
========================================================= */

function openServiceModal() {

    document
        .getElementById("serviceModal")
        .classList.remove("hidden");

}


function addService() {

    const name =
        document
            .getElementById(
                "newServiceName"
            )
            .value
            .trim();


    const port =
        Number(
            document
                .getElementById(
                    "newServicePort"
                )
                .value
        );


    const protocol =
        document
            .getElementById(
                "newServiceProtocol"
            )
            .value;


    if (!name || !port) {

        showToast(
            "Enter service name and port.",
            "error"
        );

        return;

    }


    state.services.push({

        id:
            `svc-${Date.now()}`,

        serviceName:
            name,

        port:
            port,

        protocol:
            protocol,

        monitoringEnabled:
            true,

        status:
            "Unavailable"

    });


    closeModal("serviceModal");

    renderServices();


    document
        .getElementById(
            "newServiceName"
        )
        .value = "";


    document
        .getElementById(
            "newServicePort"
        )
        .value = "";


    showToast(
        `${name} added to monitoring.`,
        "success"
    );

}


function toggleService(id) {

    const service =
        state.services.find(
            s => s.id === id
        );


    if (!service)
        return;


    service.monitoringEnabled =
        !service.monitoringEnabled;


    renderServices();


    showToast(
        `${service.serviceName} monitoring ${
            service.monitoringEnabled
                ? "enabled"
                : "disabled"
        }.`,
        "success"
    );

}


function removeService(id) {

    const service =
        state.services.find(
            s => s.id === id
        );


    if (!service)
        return;


    if (
        !confirm(
            `Remove ${service.serviceName} from monitoring?`
        )
    )
        return;


    state.services =
        state.services.filter(
            s => s.id !== id
        );


    renderServices();


    showToast(
        `${service.serviceName} removed.`,
        "success"
    );

}


/* =========================================================
   NETWORK TOPOLOGY
========================================================= */

function renderNetwork() {

    const container =
        document.getElementById(
            "topologyDevices"
        );


    container.innerHTML =
        state.devices.map(device => {

            return `

                <div
                    class="topology-device"
                    onclick="
                        openDeviceDetails(
                            '${device.deviceId}'
                        )
                    "
                >

                    <div class="mini-pc">
                        🖥
                    </div>

                    <strong>
                        ${device.hostname}
                    </strong>

                    <small>
                        ${device.ipAddress}
                    </small>

                    <small
                        class="${
                            device.status === "online"
                            ? "device-online"
                            : "device-offline"
                        }"
                    >
                        ●
                        ${device.status}
                        ·
                        ${device.openPorts} ports
                    </small>

                </div>

            `;

        }).join("");

}


/* =========================================================
   SCAN HISTORY
========================================================= */

function renderHistory() {

    const table =
        document.getElementById(
            "historyTable"
        );


    table.innerHTML =
        state.scans.map(scan => {

            return `

                <tr>

                    <td>
                        <strong>
                            ${scan.id}
                        </strong>
                    </td>

                    <td>
                        ${scan.network}
                    </td>

                    <td>
                        ${scan.date}
                    </td>

                    <td>
                        ${scan.devices}
                    </td>

                    <td>
                        ${scan.openPorts}
                    </td>

                    <td>
                        ${scan.duration}
                    </td>

                    <td>

                        <span class="history-status">
                            ✓ ${scan.status}
                        </span>

                    </td>

                    <td>

                        <div class="history-actions">

                            <button
                                class="small-action"
                                onclick="
                                    viewScan(
                                        '${scan.id}'
                                    )
                                "
                            >
                                View
                            </button>

                            <button
                                class="small-action"
                                onclick="
                                    exportScan(
                                        '${scan.id}'
                                    )
                                "
                            >
                                Export
                            </button>

                            <button
                                class="small-action"
                                onclick="
                                    deleteScan(
                                        '${scan.id}'
                                    )
                                "
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   RECENT SCANS
========================================================= */

function renderRecentScans() {

    const table =
        document.getElementById(
            "recentScanTable"
        );


    table.innerHTML =
        state.scans.slice(0,3)
            .map(scan => {

                return `

                    <tr>

                        <td>
                            <strong>
                                ${scan.id}
                            </strong>
                        </td>

                        <td>
                            ${scan.network}
                        </td>

                        <td>
                            ${scan.date}
                        </td>

                        <td>
                            ${scan.duration}
                        </td>

                        <td>
                            ${scan.devices}
                        </td>

                        <td>
                            ${scan.openPorts}
                        </td>

                        <td>
                            <span class="history-status">
                                ✓ Completed
                            </span>
                        </td>

                    </tr>

                `;

            }).join("");

}


/* =========================================================
   START NETWORK SCAN
========================================================= */

function startScan() {

    if (state.scanRunning) {

        showToast(
            "A scan is already running.",
            "error"
        );

        return;

    }


    const network =
        document
            .getElementById(
                "networkRange"
            )
            .value
            .trim();


    if (!validateNetworkRange(network)) {

        showToast(
            "Invalid or unauthorized network range.",
            "error"
        );

        return;

    }


    state.scanRunning =
        true;

    state.progress =
        0;


    document
        .getElementById(
            "startScanBtn"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "stopScanBtn"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "scanResult"
        )
        .classList.add("hidden");


    resetScanSteps();


    if (DEMO_MODE) {

        simulateScan();

    } else {

        performRealScan(network);

    }

}


/* =========================================================
   NETWORK VALIDATION
========================================================= */

function validateNetworkRange(network) {

    /*
        Frontend validation.

        IMPORTANT:
        Real security validation must happen
        again in the backend.

        Demo authorized subnet:
        192.168.1.0/24

        We also allow 192.168.10.x - 192.168.19.x
        for the simulated department labs.
    */


    const cidrRegex =
        /^192\.168\.(\d{1,3})\.0\/24$/;


    const match =
        network.match(cidrRegex);


    if (!match)
        return false;


    const third =
        Number(match[1]);


    return (
        third >= 1 &&
        third <= 254
    );

}


/* =========================================================
   SIMULATED SCAN
========================================================= */

function simulateScan() {

    const steps = [
        {
            progress: 15,
            text: "Discovering devices..."
        },
        {
            progress: 35,
            text: "Identifying reachable hosts..."
        },
        {
            progress: 58,
            text: "Scanning predefined ports..."
        },
        {
            progress: 78,
            text: "Detecting services..."
        },
        {
            progress: 92,
            text: "Processing results..."
        },
        {
            progress: 100,
            text: "Scan completed."
        }
    ];


    let index = 0;


    state.scanTimer =
        setInterval(() => {

            if (!state.scanRunning) {

                clearInterval(
                    state.scanTimer
                );

                return;

            }


            const step =
                steps[index];


            updateScanProgress(
                step.progress,
                step.text
            );


            if (index < 5)
                activateStep(index);


            index++;


            if (index >= steps.length) {

                clearInterval(
                    state.scanTimer
                );

                completeScan();

            }

        }, 900);

}


/* =========================================================
   REAL API SCAN
========================================================= */

async function performRealScan(network) {

    try {

        const response =
            await fetch(
                `${API_BASE}/scans/start`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        networkRange:
                            network,

                        department:
                            state.department,

                        lab:
                            state.lab,

                        scanType:
                            document
                                .querySelector(
                                    'input[name="scanType"]:checked'
                                )
                                .value

                    })

                }
            );


        if (!response.ok)
            throw new Error(
                "Scan request failed"
            );


        const result =
            await response.json();


        state.devices =
            result.devices || state.devices;


        completeScan(
            result
        );


    } catch(error) {

        state.scanRunning =
            false;


        showToast(
            "Backend unavailable. Switch DEMO_MODE to true or start the API server.",
            "error"
        );

        resetScanUI();

    }

}


/* =========================================================
   SCAN PROGRESS
========================================================= */

function updateScanProgress(
    percent,
    text
) {

    state.progress =
        percent;


    document
        .getElementById(
            "progressFill"
        )
        .style.width =
        `${percent}%`;


    document
        .getElementById(
            "scanPercent"
        )
        .textContent =
        `${percent}%`;


    document
        .getElementById(
            "scanStatusText"
        )
        .textContent =
        text;

}


function activateStep(index) {

    for (
        let i = 0;
        i <= index;
        i++
    ) {

        const step =
            document.getElementById(
                `step${i + 1}`
            );


        if (step) {

            step.classList.add(
                i === index
                    ? "active"
                    : "completed"
            );

        }

    }

}


function resetScanSteps() {

    document
        .querySelectorAll(
            ".scan-step"
        )
        .forEach(step => {

            step.classList.remove(
                "active",
                "completed"
            );

        });

}


function completeScan(result) {

    state.scanRunning =
        false;


    state.progress =
        100;


    updateScanProgress(
        100,
        "SCAN COMPLETED"
    );


    document
        .getElementById(
            "stopScanBtn"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "startScanBtn"
        )
        .classList.remove("hidden");


    document
        .querySelectorAll(
            ".scan-step"
        )
        .forEach(step => {

            step.classList.remove(
                "active"
            );

            step.classList.add(
                "completed"
            );

        });


    const devices =
        state.devices.length;


    const online =
        state.devices.filter(
            d => d.status === "online"
        ).length;


    const offline =
        state.devices.filter(
            d => d.status === "offline"
        ).length;


    const ports =
        state.devices.reduce(
            (sum,d) =>
                sum + d.openPorts,
            0
        );


    const services =
        state.devices.reduce(
            (sum,d) =>
                sum + d.activeServices,
            0
        );


    setText(
        "resultDevices",
        result?.devicesFound || devices
    );

    setText(
        "resultOnline",
        result?.onlineDevices || online
    );

    setText(
        "resultOffline",
        result?.offlineDevices || offline
    );

    setText(
        "resultPorts",
        result?.openPorts || ports
    );

    setText(
        "resultServices",
        result?.servicesDetected || services
    );

    setText(
        "resultDuration",
        result?.duration || "12 sec"
    );


    document
        .getElementById(
            "scanResult"
        )
        .classList.remove(
            "hidden"
        );


    const scan = {

        id:
            `SCAN-${String(
                state.scans.length + 4
            ).padStart(3,"0")}`,

        network:
            document
                .getElementById(
                    "networkRange"
                )
                .value,

        date:
            new Date()
                .toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

        duration:
            "12 sec",

        devices:
            devices,

        openPorts:
            ports,

        status:
            "Completed"

    };


    state.scans.unshift(
        scan
    );


    renderAll();


    showToast(
        `Network scan completed for ${state.department} - ${state.lab}.`,
        "success"
    );

}


function stopScan() {

    if (!state.scanRunning)
        return;


    state.scanRunning =
        false;


    clearInterval(
        state.scanTimer
    );


    resetScanUI();


    showToast(
        "Network scan stopped.",
        "error"
    );

}


function resetScanUI() {

    document
        .getElementById(
            "startScanBtn"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "stopScanBtn"
        )
        .classList.add(
            "hidden"
        );


    updateScanProgress(
        0,
        "Ready to scan"
    );

}


/* =========================================================
   REFRESH
========================================================= */

function refreshDashboard() {

    /*
        In real application this should call:

        GET /api/dashboard/stats
        GET /api/devices
    */

    if (DEMO_MODE) {

        state.devices.forEach(device => {

            if (
                Math.random() < 0.04
            ) {

                device.status =
                    device.status === "online"
                        ? "offline"
                        : "online";

            }

        });

        renderAll();

        showToast(
            "Dashboard refreshed.",
            "success"
        );

    } else {

        loadFromAPI();

    }

}


function refreshDevices() {

    refreshDashboard();

}


/* =========================================================
   API DATA
========================================================= */

async function loadFromAPI() {

    try {

        const [
            devicesResponse,
            servicesResponse,
            scansResponse
        ] = await Promise.all([

            fetch(
                `${API_BASE}/devices`
            ),

            fetch(
                `${API_BASE}/services`
            ),

            fetch(
                `${API_BASE}/scans`
            )

        ]);


        if (
            devicesResponse.ok
        ) {

            state.devices =
                await devicesResponse.json();

        }


        if (
            servicesResponse.ok
        ) {

            state.services =
                await servicesResponse.json();

        }


        if (
            scansResponse.ok
        ) {

            state.scans =
                await scansResponse.json();

        }


        renderAll();


    } catch(error) {

        showToast(
            "Unable to connect to backend.",
            "error"
        );

    }

}


/* =========================================================
   SCAN COMPARISON
========================================================= */

function openCompareModal() {

    const previous =
        document.getElementById(
            "previousScan"
        );

    const current =
        document.getElementById(
            "currentScan"
        );


    const options =
        state.scans.map(scan => {

            return `
                <option value="${scan.id}">
                    ${scan.id} -
                    ${scan.date}
                </option>
            `;

        }).join("");


    previous.innerHTML =
        options;

    current.innerHTML =
        options;


    if (state.scans.length >= 2) {

        previous.value =
            state.scans[1].id;

        current.value =
            state.scans[0].id;

    }


    document
        .getElementById(
            "compareModal"
        )
        .classList.remove(
            "hidden"
        );

}


function compareScans() {

    const previousId =
        document
            .getElementById(
                "previousScan"
            )
            .value;


    const currentId =
        document
            .getElementById(
                "currentScan"
            )
            .value;


    const previous =
        state.scans.find(
            s => s.id === previousId
        );


    const current =
        state.scans.find(
            s => s.id === currentId
        );


    if (!previous || !current) {

        showToast(
            "Select two scans.",
            "error"
        );

        return;

    }


    const deviceChange =
        current.devices -
        previous.devices;


    const portChange =
        current.openPorts -
        previous.openPorts;


    const result =
        document.getElementById(
            "comparisonResult"
        );


    const content =
        document.getElementById(
            "comparisonContent"
        );


    content.innerHTML = `

        <div class="compare-grid">

            <div class="compare-card">

                <h4>
                    Previous Scan
                </h4>

                <div class="compare-stat">
                    <span>Scan ID</span>
                    <b>${previous.id}</b>
                </div>

                <div class="compare-stat">
                    <span>Online Devices</span>
                    <b>${previous.devices}</b>
                </div>

                <div class="compare-stat">
                    <span>Open Ports</span>
                    <b>${previous.openPorts}</b>
                </div>

                <div class="compare-stat">
                    <span>Duration</span>
                    <b>${previous.duration}</b>
                </div>

            </div>


            <div class="compare-card">

                <h4>
                    Current Scan
                </h4>

                <div class="compare-stat">
                    <span>Scan ID</span>
                    <b>${current.id}</b>
                </div>

                <div class="compare-stat">
                    <span>Online Devices</span>
                    <b>${current.devices}</b>
                </div>

                <div class="compare-stat">
                    <span>Open Ports</span>
                    <b>${current.openPorts}</b>
                </div>

                <div class="compare-stat">
                    <span>Duration</span>
                    <b>${current.duration}</b>
                </div>

            </div>

        </div>


        <div class="change-grid">

            <div class="change">
                ${
                    portChange >= 0
                    ? "+"
                    : ""
                }
                ${portChange}
                open ports changed
            </div>


            <div class="change">
                ${
                    deviceChange >= 0
                    ? "+"
                    : ""
                }
                ${deviceChange}
                devices detected
            </div>


            <div class="change">
                Network availability changed by
                ${
                    deviceChange >= 0
                    ? "+"
                    : ""
                }
                ${deviceChange}
            </div>

        </div>

    `;


    closeModal(
        "compareModal"
    );


    result.classList.remove(
        "hidden"
    );


    result.scrollIntoView({
        behavior: "smooth"
    });


    showToast(
        "Scan comparison generated.",
        "success"
    );

}


/* =========================================================
   VIEW / DELETE / EXPORT SCANS
========================================================= */

function viewScan(id) {

    const scan =
        state.scans.find(
            s => s.id === id
        );


    if (!scan)
        return;


    showToast(
        `${scan.id}: ${scan.devices} devices, ${scan.openPorts} open ports.`,
        "success"
    );

}


function deleteScan(id) {

    if (
        !confirm(
            `Delete ${id} from scan history?`
        )
    )
        return;


    state.scans =
        state.scans.filter(
            scan => scan.id !== id
        );


    renderHistory();

    renderRecentScans();


    showToast(
        `${id} deleted.`,
        "success"
    );

}


function exportScan(id) {

    const scan =
        state.scans.find(
            s => s.id === id
        );


    if (!scan)
        return;


    const csv = [

        [
            "Scan ID",
            "Network",
            "Date",
            "Devices",
            "Open Ports",
            "Duration",
            "Status"
        ].join(","),

        [
            scan.id,
            scan.network,
            scan.date,
            scan.devices,
            scan.openPorts,
            scan.duration,
            scan.status
        ].join(",")

    ].join("\n");


    downloadFile(
        `${scan.id}.csv`,
        csv,
        "text/csv"
    );


    showToast(
        `${scan.id} exported.`,
        "success"
    );

}


function exportAllScans() {

    const rows = [

        [
            "Scan ID",
            "Network",
            "Date",
            "Devices",
            "Open Ports",
            "Duration",
            "Status"
        ].join(",")

    ];


    state.scans.forEach(scan => {

        rows.push([

            scan.id,
            scan.network,
            scan.date,
            scan.devices,
            scan.openPorts,
            scan.duration,
            scan.status

        ].join(","));

    });


    downloadFile(
        "MSEC_Lab_Scan_History.csv",
        rows.join("\n"),
        "text/csv"
    );


    showToast(
        "Scan history exported.",
        "success"
    );

}


function downloadFile(
    filename,
    content,
    type
) {

    const blob =
        new Blob(
            [content],
            { type }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        filename;

    link.click();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {

    const saved =
        localStorage.getItem(
            "msecSettings"
        );


    if (saved) {

        try {

            state.settings =
                {
                    ...state.settings,
                    ...JSON.parse(saved)
                };

        } catch(error) {

            console.log(
                "Settings load error"
            );

        }

    }

}


function renderSettings() {

    setValue(
        "settingNetwork",
        state.settings.network
    );

    setValue(
        "settingPorts",
        state.settings.ports
    );

    setValue(
        "scanTimeout",
        state.settings.timeout
    );

    setValue(
        "scanInterval",
        state.settings.interval
    );


    const autoRefresh =
        document.getElementById(
            "autoRefresh"
        );

    const scheduled =
        document.getElementById(
            "scheduledScan"
        );

    const notifications =
        document.getElementById(
            "notifications"
        );


    if (autoRefresh)
        autoRefresh.checked =
            state.settings.autoRefresh;

    if (scheduled)
        scheduled.checked =
            state.settings.scheduled;

    if (notifications)
        notifications.checked =
            state.settings.notifications;


    const theme =
        document.getElementById(
            "themeSelect"
        );


    if (theme)
        theme.value =
            state.settings.theme;

}


function saveSettings() {

    state.settings.network =
        document.getElementById(
            "settingNetwork"
        ).value;


    state.settings.ports =
        document.getElementById(
            "settingPorts"
        ).value;


    state.settings.timeout =
        Number(
            document.getElementById(
                "scanTimeout"
            ).value
        );


    state.settings.interval =
        Number(
            document.getElementById(
                "scanInterval"
            ).value
        );


    state.settings.autoRefresh =
        document.getElementById(
            "autoRefresh"
        ).checked;


    state.settings.scheduled =
        document.getElementById(
            "scheduledScan"
        ).checked;


    state.settings.notifications =
        document.getElementById(
            "notifications"
        ).checked;


    localStorage.setItem(
        "msecSettings",
        JSON.stringify(
            state.settings
        )
    );


    document
        .getElementById(
            "networkRange"
        )
        .value =
        state.settings.network;


    applyTheme();


    showToast(
        "Settings saved successfully.",
        "success"
    );

}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    state.settings.theme =
        document.body.classList.contains(
            "dark"
        )
            ? "light"
            : "dark";


    applyTheme();


    localStorage.setItem(
        "msecSettings",
        JSON.stringify(
            state.settings
        )
    );

}


function changeThemeFromSetting() {

    state.settings.theme =
        document
            .getElementById(
                "themeSelect"
            )
            .value;


    applyTheme();

}


function applyTheme() {

    document.body.classList.toggle(
        "dark",
        state.settings.theme === "dark"
    );


    const theme =
        document.getElementById(
            "themeSelect"
        );


    if (theme)
        theme.value =
            state.settings.theme;

}


/* =========================================================
   AUTO REFRESH
========================================================= */

let autoRefreshTimer = null;


function startAutoRefresh() {

    clearInterval(
        autoRefreshTimer
    );


    autoRefreshTimer =
        setInterval(() => {

            if (
                state.settings.autoRefresh &&
                !state.scanRunning
            ) {

                refreshDashboard();

            }

        }, 30000);

}


/* =========================================================
   MODALS
========================================================= */

function closeModal(id) {

    document
        .getElementById(id)
        .classList.add(
            "hidden"
        );

}


function closeModalOutside(
    event,
    id
) {

    if (
        event.target.id === id
    ) {

        closeModal(id);

    }

}


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

function toggleSidebar() {

    document
        .getElementById(
            "sidebar"
        )
        .classList.toggle(
            "show"
        );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(() => {

        toast.remove();

    }, 3500);

}


/* =========================================================
   UTILITIES
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element)
        element.textContent =
            value;

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element)
        element.value =
            value;

}