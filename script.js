// ===================================
// MAP INITIALIZATION
// ===================================

const map = L.map("map").setView([23.5937, 78.9629], 5);

const streetMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap"
    }
);

const satelliteMap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Tiles © Esri",
        maxNativeZoom: 17,
        maxZoom: 19
    }
);

// Default map
streetMap.addTo(map);

// Layer Switcher
L.control.layers(
    {
        "Street Map": streetMap,
        "Satellite": satelliteMap
    }
).addTo(map);

// ===================================
// VARIABLES
// ===================================

let allProjects = [];
let markers = [];

// ===================================
// LOAD PROJECTS
// ===================================

fetch("data/projects.json")
.then(response => response.json())
.then(projects => {

    allProjects = projects;

    updateDashboard(projects);

    populateFilters(projects);

    loadMarkers(projects);

})
.catch(error => {

    console.error(
        "Error Loading JSON:",
        error
    );

});

// ===================================
// MARKER COLOR
// ===================================

function getMarkerColor(status){

    if(!status) return "#2563eb";

    switch(status.toLowerCase()){

        case "completed":
            return "#2563eb";

        case "ongoing":
            return "#f59e0b";

        case "delayed":
            return "#dc2626";

        case "pending":
            return "#9333ea";

        default:
            return "#2563eb";
    }
}

// ===================================
// LOAD MARKERS
// ===================================

function loadMarkers(projects){

    markers.forEach(marker => {

        map.removeLayer(marker);

    });

    markers = [];

    const bounds = [];

    projects.forEach(project => {

    if (
        !project.latitude ||
        !project.longitude ||
        isNaN(parseFloat(project.latitude)) ||
        isNaN(parseFloat(project.longitude))
    ) {
        return;
    }

        const marker = L.circleMarker(
            [
                parseFloat(project.latitude),
                parseFloat(project.longitude)
            ],
            {
                radius:10,
                fillColor:getMarkerColor(project.status),
                color:"#ffffff",
                weight:2,
                opacity:1,
                fillOpacity:0.95
            }
        ).addTo(map);

        marker.bindPopup(`

            <div style="min-width:280px">

                <h3 style="
                    color:#0b3466;
                    margin-bottom:8px;
                ">
                    ${project.id}
                </h3>

                <b>
                    ${project.projectName}
                </b>

                <hr>

                <p>
                    <b>Status:</b>
                    ${project.status}
                </p>

                <p>
                    <b>Voltage:</b>
                    ${project.voltageLevel}
                </p>

                <p>
                    <b>Location:</b>
                    ${project.location}
                </p>

                <p>
                    <b>Client:</b>
                    ${project.clientName}
                </p>

                <button
                    onclick="
                        satelliteMap.addTo(map);
                        map.flyTo(
                            [
                                ${project.latitude},
                                ${project.longitude}
                            ],
                            16,
                            {
                                duration:2
                            }
                        );
                    "
                    class="project-btn"
                >
                    Zoom To Site
                </button>

                <button
                    onclick="
                    viewProject(
                    '${project.id}'
                    )"
                    class="project-btn"
                    style="
                        margin-top:8px;
                        background:#2563eb;
                    "
                >
                    View Details
                </button>

            </div>

        `);

        markers.push(marker);

        bounds.push([
            parseFloat(project.latitude),
            parseFloat(project.longitude)
        ]);

    });

    if(bounds.length > 0){

        map.fitBounds(
            bounds,
            {
                padding:[80,80],
                maxZoom:8
            }
        );

    }

}

// ===================================
// SEARCH + FILTERS
// ===================================

function applyFilters(){

    const searchValue =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const voltageValue =
        document
        .getElementById("voltageFilter")
        .value;

    const stateValue =
        document
        .getElementById("stateFilter")
        .value;

    const filteredProjects =

        allProjects.filter(project => {

            const searchText = `
                ${project.id}
                ${project.projectName}
                ${project.location}
                ${project.state}
                ${project.clientName}
                ${project.voltageLevel}
            `.toLowerCase();

            const searchMatch =
                searchText.includes(searchValue);

            const voltageMatch =
                voltageValue === "" ||
                project.voltageLevel === voltageValue;

            const stateMatch =
                stateValue === "" ||
                project.state === stateValue;

            return (
                searchMatch &&
                voltageMatch &&
                stateMatch
            );

        });

    loadMarkers(filteredProjects);

    updateDashboard(filteredProjects);

}

// ===================================
// FILTER DROPDOWNS
// ===================================

function populateFilters(projects){

    const voltageFilter =
        document.getElementById(
            "voltageFilter"
        );

    const stateFilter =
        document.getElementById(
            "stateFilter"
        );

    const voltages =
        [...new Set(
            projects.map(
                p => p.voltageLevel
            )
        )];

    const states =
        [...new Set(
            projects.map(
                p => p.state
            )
        )];

    voltages.forEach(voltage => {

        const option =
        document.createElement(
            "option"
        );

        option.value =
        voltage;

        option.textContent =
        voltage;

        voltageFilter.appendChild(
            option
        );

    });

    states.forEach(state => {

        const option =
        document.createElement(
            "option"
        );

        option.value =
        state;

        option.textContent =
        state;

        stateFilter.appendChild(
            option
        );

    });

}

// ===================================
// DASHBOARD CARDS
// ===================================

function updateDashboard(projects){

    document.getElementById(
        "totalProjects"
    ).innerText =
    projects.length;

    const states =
        [...new Set(
            projects.map(
                p => p.state
            )
        )];

    document.getElementById(
        "totalStates"
    ).innerText =
    states.length;

    const completed =
        projects.filter(
            p =>
            p.status &&
            p.status.toLowerCase() === "completed"
        ).length;

    const ongoing =
        projects.filter(
            p =>
            p.status &&
            p.status.toLowerCase() === "ongoing"
        ).length;

    document.getElementById(
        "completedProjects"
    ).innerText =
    completed;

    document.getElementById(
        "ongoingProjects"
    ).innerText =
    ongoing;

}

// ===================================
// OPEN DETAILS PAGE
// ===================================

function viewProject(projectId){

    localStorage.setItem(
        "selectedProject",
        projectId
    );

    window.location.href =
    "project-details.html";

}
