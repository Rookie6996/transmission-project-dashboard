const projectId =
localStorage.getItem("selectedProject");

fetch("data/projects.json")
.then(response => response.json())
.then(projects => {

    const project =
    projects.find(
        p => p.id === projectId
    );

    if(!project){

        document.getElementById(
            "projectContent"
        ).innerHTML =
        "<h2>Project Not Found</h2>";

        return;
    }

    renderProject(project);

});

async function renderProject(project){

    let galleryHTML = "";

    const imageFolder =
    "images/" + project.imageFolder;

    const images = [];

    for(let i = 1; i <= 20; i++){

        const imagePath =
        `${imageFolder}/${i}.jpeg`;

        const exists =
        await imageExists(imagePath);

        if(exists){

            images.push(imagePath);

        }

    }

    images.forEach(image => {

        galleryHTML += `

            <img
                src="${image}"
                class="gallery-image"
                onclick="openImage('${image}')"
            >

        `;

    });

    document.getElementById(
        "projectContent"
    ).innerHTML = `

        <h1 class="project-title">
            ${project.projectName}
        </h1>

        <div class="info-grid">

            <div class="info-card">
                <h3>Project ID</h3>
                <p>${project.id}</p>
            </div>

            <div class="info-card">
                <h3>Status</h3>
                <p>${project.status}</p>
            </div>

            <div class="info-card">
                <h3>Voltage Level</h3>
                <p>${project.voltageLevel}</p>
            </div>

            <div class="info-card">
                <h3>Client</h3>
                <p>${project.clientName}</p>
            </div>

            <div class="info-card">
                <h3>Location</h3>
                <p>${project.location}</p>
            </div>

            <div class="info-card">
                <h3>Project Cost</h3>
                <p>${project.projectCost}</p>
            </div>

        </div>

        <h2>Project Gallery</h2>

        <div class="gallery">

            ${galleryHTML}

        </div>

        <h2>Project Details</h2>

        <table class="details-table">

            <tr>
                <td>State</td>
                <td>${project.state}</td>
            </tr>

            <tr>
                <td>Technology</td>
                <td>${project.technology}</td>
            </tr>

            <tr>
                <td>Project Type</td>
                <td>${project.projectType}</td>
            </tr>

            <tr>
                <td>Scope</td>
                <td>${project.scope}</td>
            </tr>

            <tr>
                <td>Completion Date</td>
                <td>${project.completionDate}</td>
            </tr>

        </table>

        <div
            id="imageModal"
            class="image-modal"
            onclick="closeImage()"
        >

            <img
                id="modalImage"
                class="modal-image"
            >

        </div>

    `;
}

function imageExists(url){

    return new Promise(resolve => {

        const img = new Image();

        img.onload = () => resolve(true);

        img.onerror = () => resolve(false);

        img.src = url;

    });

}

function openImage(src){

    document.getElementById(
        "imageModal"
    ).style.display = "flex";

    document.getElementById(
        "modalImage"
    ).src = src;
}

function closeImage(){

    document.getElementById(
        "imageModal"
    ).style.display = "none";
}