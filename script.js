// ==============================
// STUDENT PROFILE
// ==============================
let clearQuizHistory =
    document.querySelector("#clear-quiz-history");

let quizHistoryList =
    document.querySelector("#quiz-history-list");

 let historyBackDashboard =
    document.querySelector("#history-back-dashboard");

let scoreCardCanvas = null;

let studentNameInput =
    document.querySelector("#student-name-input");

let saveStudentName =
    document.querySelector("#save-student-name");

let studentSetup =
    document.querySelector("#student-setup");

let studentName =
    document.querySelector("#student-profile strong");

let profileAvatar =
    document.querySelector("#profile-avatar");

let dashboardGreeting =
    document.querySelector("#dashboard-header h2");

let editProfile =
    document.querySelector("#edit-profile");

 let openSettings =
    document.querySelector("#open-settings");

let selectedMaterialId = null;


// Tracks whether Summary, Flash Deck, or Quiz is processing material.
let isMaterialProcessing = false;


/**
 * Gets or creates an ID stored separately in each browser's local storage.
 */
function getAviaBrowserId() {
    const storageKey = "avia_browser_id";
    let browserId = localStorage.getItem(storageKey);

    if (!browserId) {
        browserId = crypto.randomUUID();
        localStorage.setItem(storageKey, browserId);
    }

    return browserId;
}


// Disables or re-enables all three AI study actions together.
function setMaterialProcessing(isProcessing) {
    isMaterialProcessing = isProcessing;

    const materialActionButtons = [
        document.querySelector("#summarizeButton"),
        document.querySelector("#flashcardButton"),
        document.querySelector("#StartQuiz")
    ];

    materialActionButtons.forEach(function(actionButton) {
        if (actionButton) {
            actionButton.disabled = isProcessing;
        }
    });
}
// Remember which screen the student came from before opening Settings
let settingsPreviousScreen = "dashboard";

const aviaChatButton = document.getElementById("aviaChatButton");
const aviaChatSection = document.getElementById("avia-chat-section");
const aviaBackDashboard = document.getElementById("avia-back-dashboard");

const aviaChatInput = document.getElementById("avia-chat-input");
const aviaSendButton = document.getElementById("avia-send-button");
const aviaChatMessages = document.getElementById("avia-chat-messages");

const materialsLibrary =
    document.querySelector(
        "#materials-library"
    );

const materialsBackDashboard =
    document.querySelector(
        "#materials-back-dashboard"
    );

const allMaterialsList =
    document.querySelector(
        "#all-materials-list"
    );

const viewAllMaterials =
    document.querySelector(
        "#change-color"
    );

  
// ==============================
// INDEXEDDB — FILE STORAGE
// ==============================

let studyDatabase;

const databaseRequest = indexedDB.open(
    "AviaClassroomDB",
    1
);

databaseRequest.addEventListener(
    "upgradeneeded",
    function(event) {

        studyDatabase = event.target.result;

        studyDatabase.createObjectStore(
            "studyFiles",
            {
                keyPath: "id"
            }
        );

        console.log(
            "AVIA Classroom database created."
        );
    }
);

databaseRequest.addEventListener(
    "success",
    function(event) {

        studyDatabase =
            event.target.result;

        console.log(
            "AVIA Classroom database ready."
        );
    }
);

databaseRequest.addEventListener(
    "error",
    function() {

        console.error(
            "Could not open AVIA Classroom database."
        );
    }
);


// ==============================
// SAVE ACTUAL FILE TO INDEXEDDB
// ==============================

function saveFileToDatabase(file, materialId) {

    if (!studyDatabase) {
        console.error(
            "Database is not ready yet."
        );

        return;
    }

    let transaction =
        studyDatabase.transaction(
            "studyFiles",
            "readwrite"
        );

    let store =
        transaction.objectStore(
            "studyFiles"
        );

    let fileData = {

        id: materialId,

        name: file.name,

        type: file.type,

        file: file

    };

    store.put(fileData);

    transaction.addEventListener(
        "complete",
        function() {

            console.log(
                "File saved to IndexedDB:",
                file.name
            );

        }
    );

    transaction.addEventListener(
        "error",
        function() {

            console.error(
                "Could not save file to IndexedDB."
            );

        }
    );
}
// ==============================
// OPEN FILE FROM INDEXEDDB
// ==============================

function openFileFromDatabase(materialId) {

    if (!studyDatabase) {
        console.error(
            "Database is not ready yet."
        );

        return;
    }

    let transaction =
        studyDatabase.transaction(
            "studyFiles",
            "readonly"
        );

    let store =
        transaction.objectStore(
            "studyFiles"
        );

    let request =
        store.get(materialId);

    request.addEventListener(
        "success",
        function() {

            let fileData =
                request.result;

            if (!fileData) {

                console.error(
                    "File not found."
                );

                return;
            }

            let fileURL =
                URL.createObjectURL(
                    fileData.file
                );

            window.open(
                fileURL,
                "_blank"
            );

        }
    );

    request.addEventListener(
        "error",
        function() {

            console.error(
                "Could not retrieve file."
            );

        }
    );
}

 // Delete a study file from IndexedDB
 function deleteFileFromDatabase(materialId) {

    if (!studyDatabase) {
        console.error(
            "Database is not ready yet."
        );

        return;
    }

    let transaction =
        studyDatabase.transaction(
            "studyFiles",
            "readwrite"
        );

    let store =
        transaction.objectStore(
            "studyFiles"
        );

    let request =
        store.delete(materialId);

    request.addEventListener(
        "success",
        function() {

            console.log(
                "File deleted from IndexedDB:",
                materialId
            );

        }
    );

    request.addEventListener(
        "error",
        function() {

            console.error(
                "Could not delete file from IndexedDB."
            );

        }
    );
}

// Open Settings and remember the exact screen the student came from
openSettings.addEventListener(
    "click",
    function() {

        // Check which screen is currently visible
        if (
            document.querySelector("#quiz-section").getBoundingClientRect().height > 0
        ) {

            settingsPreviousScreen = "quiz";

        } else if (
            document.querySelector("#summaryScreen").getBoundingClientRect().height > 0
        ) {

            settingsPreviousScreen = "summary";

        } else if (
            document.querySelector("#flashcardScreen").getBoundingClientRect().height > 0
        ) {

            settingsPreviousScreen = "flashcards";

        } else if (
            document.querySelector("#avia-chat-section").getBoundingClientRect().height > 0
        ) {

            settingsPreviousScreen = "avia-chat";

        } else if (
            document.querySelector("#quiz-history").getBoundingClientRect().height > 0
        ) {

            settingsPreviousScreen = "quiz-history";

        } else if (
            document.querySelector("#materials-library").getBoundingClientRect().height > 0
        ) {

            settingsPreviousScreen = "materials-library";

        } else {

            settingsPreviousScreen = "dashboard";
        }

        console.log(
            "Settings opened from:",
            settingsPreviousScreen
        );

        // Hide dashboard
        document.querySelector("#dashboard-header").style.display = "none";
        document.querySelector("#uploads-section").style.display = "none";
        document.querySelector("#history").style.display = "none";
        document.querySelector("#feature-cards").style.display = "none";

        // Hide all other screens
        document.querySelector("#quiz-section").style.display = "none";
        document.querySelector("#quiz-history").style.display = "none";
        document.querySelector("#summaryScreen").style.display = "none";
        document.querySelector("#settings-section").style.display = "none";
        document.querySelector("#avia-chat-section").style.display = "none";
        document.querySelector("#materials-library").style.display = "none";

        // Hide Flash Deck
        flashcardScreen.style.display = "none";

        // Show Settings
        document.querySelector("#settings-section").style.display = "block";
    }
);


let settingsBackDashboard =
    document.querySelector(
        "#settings-back-dashboard"
    );


// Return from Settings to the exact screen the student came from
settingsBackDashboard.addEventListener(
    "click",
    function() {

        // Hide Settings
        document.querySelector(
            "#settings-section"
        ).style.display = "none";


        // Return to Quiz
        if (settingsPreviousScreen === "quiz") {

            document.querySelector(
                "#quiz-section"
            ).style.display = "block";


        // Return to Summary
        } else if (settingsPreviousScreen === "summary") {

            document.querySelector(
                "#summaryScreen"
            ).style.display = "block";


        // Return to Flash Deck
        } else if (settingsPreviousScreen === "flashcards") {

            flashcardScreen.style.display = "block";


        // Return to AVIA Chat
        } else if (settingsPreviousScreen === "avia-chat") {

            document.querySelector(
                "#avia-chat-section"
            ).style.display = "block";


        // Return to Quiz History
        } else if (settingsPreviousScreen === "quiz-history") {

            document.querySelector(
                "#quiz-history"
            ).style.display = "block";


        // Return to Material Library
        } else if (settingsPreviousScreen === "materials-library") {

            document.querySelector(
                "#materials-library"
            ).style.display = "block";


        // Return to Dashboard
        } else {

            document.querySelector(
                "#dashboard-header"
            ).style.display = "flex";

            document.querySelector(
                "#uploads-section"
            ).style.display = "block";

            document.querySelector(
                "#history"
            ).style.display = "block";

            document.querySelector(
                "#feature-cards"
            ).style.display = "flex";
        }

        console.log(
            "Settings returned to:",
            settingsPreviousScreen
        );
    }
);

let darkModeToggle =
    document.querySelector(
        "#dark-mode-toggle"
    );


// Apply saved theme when the page loads
let savedTheme =
    localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    darkModeToggle.checked = true;

} else {

    document.body.classList.remove(
        "dark-mode"
    );

    darkModeToggle.checked = false;

}


// Change theme when toggle is clicked
darkModeToggle.addEventListener(
    "change",
    function() {

        if (darkModeToggle.checked) {

            document.body.classList.add(
                "dark-mode"
            );

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            document.body.classList.remove(
                "dark-mode"
            );

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    }
);
// ==============================
// EDIT PROFILE
// ==============================

editProfile.addEventListener("click", function() {

    studentSetup.style.display =
        "block";

    document.querySelector(
        "#dashboard-header"
    ).style.display =
        "none";

    studentNameInput.value =
        localStorage.getItem("studentName") || "";

    studentNameInput.focus();
});


// ==============================
// CHECK SAVED STUDENT
// ==============================

let savedStudentName =
    localStorage.getItem("studentName");


if (savedStudentName) {

    studentName.textContent =
        savedStudentName;

    profileAvatar.textContent =
        savedStudentName.charAt(0).toUpperCase();

    dashboardGreeting.textContent =
        "Good evening, " +
        savedStudentName +
        " 👋";

    studentSetup.style.display =
        "none";

    document.querySelector(
        "#dashboard-header"
    ).style.display =
        "flex";

} else {

    studentSetup.style.display =
        "block";

    document.querySelector(
        "#dashboard-header"
    ).style.display =
        "none";
}


// ==============================
// SAVE STUDENT NAME
// ==============================

saveStudentName.addEventListener("click", function() {

    let name =
        studentNameInput.value.trim();


    if (name === "") {

        alert("Please enter your name.");

        return;
    }


    localStorage.setItem(
        "studentName",
        name
    );


    studentName.textContent =
        name;

    profileAvatar.textContent =
        name.charAt(0).toUpperCase();

    dashboardGreeting.textContent =
        "Good evening, " +
        name +
        " 👋";


    studentSetup.style.display =
        "none";

    document.querySelector(
        "#dashboard-header"
    ).style.display =
        "flex";
});


const summaryDownloadButton = document.querySelector("#summaryDownloadButton");

let currentSummaryData = null;
let currentSummaryMaterialName = "";

let summarizeButton =
    document.querySelector("#summarizeButton");

let flashcardButton =
    document.querySelector("#flashcardButton");

let button =
    document.querySelector("#StartQuiz");

// Stores the textbook title used for the active quiz and its score card.
let currentQuizTitle = "Study Material";

let textbook =
    document.querySelector("#textbook");

let fileName =
    document.querySelector("#fileName");

let summaryStatus =
    document.querySelector("#summaryStatus");

let flashcardStatus =
    document.querySelector("#flashcardStatus");

let quizStatus =
    document.querySelector("#quizStatus");

let quizSection =
    document.querySelector("#quiz-section");

let backDashboard =
    document.querySelector("#back-dashboard");

let openQuizHistory =
    document.querySelector("#open-quiz-history");

// Get the Summary screen elements
let summaryScreen =

    document.querySelector("#summaryScreen");

let backFromSummary =

    document.querySelector("#backFromSummary");

// Get the Summary screen Take Quiz button
let summaryTakeQuiz =
    document.querySelector("#summaryTakeQuiz");

let summaryMaterialName =

    document.querySelector("#summaryMaterialName");

let summaryOverview =

    document.querySelector("#summaryOverview");

let summaryKeyConcepts =

    document.querySelector("#summaryKeyConcepts");

let summaryImportantPoints =

    document.querySelector("#summaryImportantPoints");

// GET FLASH CARDS ELEMENT 
let flashcardScreen =
    document.querySelector(
        "#flashcardScreen"
    );

let backFromFlashcards =
    document.querySelector(
        "#backFromFlashcards"
    );

let flashcardMaterialName =
    document.querySelector(
        "#flashcardMaterialName"
    );

let flashcardCard =
    document.querySelector(
        "#flashcardCard"
    );

let flashcardFront =
    document.querySelector(
        "#flashcardFront"
    );

let flashcardBack =
    document.querySelector(
        "#flashcardBack"
    );

let flipFlashcard =
    document.querySelector(
        "#flipFlashcard"
    );

let previousFlashcard =
    document.querySelector(
        "#previousFlashcard"
    );

let nextFlashcard =
    document.querySelector(
        "#nextFlashcard"
    );

let flashcardCounter =
    document.querySelector(
        "#flashcardCounter"
    );

    // Get references to the flashcard study action buttons
let knowFlashcard = document.querySelector("#knowFlashcard");
let reviewFlashcard = document.querySelector("#reviewFlashcard");


// Store the generated flashcards and track the card currently being studied
let generatedFlashcards = [];
let currentFlashcard = 0;

// Track which flashcards the student knows and which need more review
let knownFlashcards = [];
let reviewFlashcards = [];

    // Flip the flashcard between the question and answer
flipFlashcard.addEventListener(
    "click",
    function() {

        if (
            flashcardFront.style.display ===
            "none"
        ) {

            flashcardFront.style.display =
                "block";

            flashcardBack.style.display =
                "none";

        } else {

            flashcardFront.style.display =
                "none";

            flashcardBack.style.display =
                "block";
        }
    }
);


// Allow the student to click the flashcard itself to reveal the answer
flashcardCard.addEventListener(
    "click",
    function() {
        flashcardFront.style.display = "none";
        flashcardBack.style.display = "block";
    }
);

// Move to the next flashcard in the deck
nextFlashcard.addEventListener(
    "click",
    function() {

        if (
            currentFlashcard <
            generatedFlashcards.length - 1
        ) {

            currentFlashcard++;

            flashcardFront.textContent =
                generatedFlashcards[
                    currentFlashcard
                ].question;

            flashcardBack.textContent =
                generatedFlashcards[
                    currentFlashcard
                ].answer;

            flashcardCounter.textContent =
                (currentFlashcard + 1) +
                " / " +
                generatedFlashcards.length;

                nextFlashcard.disabled = currentFlashcard === generatedFlashcards.length - 1;
                previousFlashcard.disabled = currentFlashcard === 0;

            flashcardFront.style.display =
                "block";

            flashcardBack.style.display =
                "none";
        }
    }
);

// Move to the previous flashcard in the deck
previousFlashcard.addEventListener(
    "click",
    function() {

        if (
            currentFlashcard > 0
        ) {

            currentFlashcard--;

            flashcardFront.textContent =
                generatedFlashcards[
                    currentFlashcard
                ].question;

            flashcardBack.textContent =
                generatedFlashcards[
                currentFlashcard
                ].answer;

            flashcardCounter.textContent =
                (currentFlashcard + 1) +
                " / " +
                generatedFlashcards.length;

                nextFlashcard.disabled = currentFlashcard === generatedFlashcards.length - 1;
                previousFlashcard.disabled = currentFlashcard === 0;

            flashcardFront.style.display =
                "block";

            flashcardBack.style.display =
                "none";
        }
    }
);

// Mark the current flashcard as known and move to the next card
knowFlashcard.addEventListener(
    "click",
    function() {

        if (!knownFlashcards.includes(currentFlashcard)) {
            knownFlashcards.push(currentFlashcard);
        }

        console.log(
            "Known flashcards:",
            knownFlashcards
        );

        if (
            currentFlashcard <
            generatedFlashcards.length - 1
        ) {
            nextFlashcard.click();
        }
    }
);

// Mark the current flashcard for review and reveal its answer
reviewFlashcard.addEventListener(
    "click",
    function() {

        if (!reviewFlashcards.includes(currentFlashcard)) {
            reviewFlashcards.push(currentFlashcard);
        }

        console.log(
            "Flashcards for review:",
            reviewFlashcards
        );

        flashcardBack.style.display = "block";
        flashcardFront.style.display = "none";
    }
);

    // Show the Summary screen and hide the dashboard
function showSummaryScreen() {

    document.querySelector(
        "#dashboard-header"
    ).style.display =
        "none";

    document.querySelector(
        "#uploads-section"
    ).style.display =
        "none";

    document.querySelector(
        "#history"
    ).style.display =
        "none";

    document.querySelector(
        "#feature-cards"
    ).style.display =
        "none";

    quizSection.style.display =
        "none";

    document.querySelector(
        "#quiz-history"
    ).style.display =
        "none";

    aviaChatSection.style.display =
        "none";

    materialsLibrary.style.display =
        "none";

    document.querySelector(
        "#settings-section"
    ).style.display =
        "none";

    summaryScreen.style.display =
        "block";
}

// Show the Flash Deck screen and hide the main dashboard
function showFlashcardScreen() {

    document.querySelector("#dashboard-header").style.display = "none";
    document.querySelector("#uploads-section").style.display = "none";
    document.querySelector("#history").style.display = "none";
    document.querySelector("#feature-cards").style.display = "none";
    document.querySelector("#quiz-section").style.display = "none";
    document.querySelector("#summaryScreen").style.display = "none";

    flashcardScreen.style.display = "block";

    flashcardMaterialName.textContent =
        fileName.textContent || "Study Material";
}

// Open the Flash Deck and prepare the selected study material for flashcards

flashcardButton.addEventListener("click", async function () {
    // Prevent Summary, Flash Deck, and Quiz from running simultaneously.
    if (isMaterialProcessing) return;

    if (!textbook.files || textbook.files.length === 0) {
        flashcardStatus.textContent = "Please select a textbook first.";
        return;
    }

    const selectedFile = textbook.files[0];

    // Keep the uploaded textbook's name for the quiz result and score card.
    // Keep the uploaded PDF or text filename available for the score card.
    currentQuizTitle =
    selectedFile.name.replace(/\.[^/.]+$/, "") ||
    fileName.textContent.trim() ||
    selectedFile.name;
    
    const materialId = findMaterialIdByName(selectedFile.name);

    if (!materialId) {
        flashcardStatus.textContent =
            "Could not find this textbook. Please select it again.";
        return;
    }

    setMaterialProcessing(true);
    flashcardStatus.textContent = "Preparing your flashcards...";
    flashcardButton.textContent = "Preparing...";

    try {
        
let savedFlashcards =
await getGeneratedStudyDataFromDatabase(materialId, "flashcards");

// Regenerate older saved decks that contain fewer than 10 cards.
if (!Array.isArray(savedFlashcards) || savedFlashcards.length < 10) {
const materialText = await getMaterialTextForSummary(materialId);


const response = await fetch("https://avia-classroom-v1.onrender.com/flashcards", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Browser-ID": getAviaBrowserId()
    },
    body: JSON.stringify({ text: materialText })
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.detail || "Could not generate flashcards.");
}

if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
    throw new Error("AVIA did not return any flashcards.");
}

savedFlashcards = data.flashcards;

await saveGeneratedStudyDataToDatabase(
    materialId,
    "flashcards",
    savedFlashcards
);

flashcardStatus.textContent = "Flashcards generated and saved.";
} else {
flashcardStatus.textContent =
    "Loaded your saved flashcards — no new AI request.";
}

generatedFlashcards = savedFlashcards;


generatedFlashcards = savedFlashcards;
        knownFlashcards = [];
        reviewFlashcards = [];
        currentFlashcard = 0;

        flashcardFront.textContent = generatedFlashcards[0].question;
        flashcardBack.textContent = generatedFlashcards[0].answer;
        flashcardFront.style.display = "block";
        flashcardBack.style.display = "none";
        flashcardCounter.textContent = "1 / " + generatedFlashcards.length;

        previousFlashcard.disabled = true;
        nextFlashcard.disabled = generatedFlashcards.length === 1;

        flashcardMaterialName.textContent = selectedFile.name;
        flashcardStatus.textContent = "Study material is ready.";
        showFlashcardScreen();

    } catch (error) {
        console.error("Could not prepare material for flashcards:", error);
        flashcardStatus.textContent =
            error.message || "Could not prepare study material.";
    } finally {
        // Always release the shared lock after success or failure.
        setMaterialProcessing(false);
        flashcardButton.textContent = "Create Flashcards";
    }
});

// Return from the Flash Deck screen to the dashboard
backFromFlashcards.addEventListener(
    "click",
    function() {
        flashcardScreen.style.display = "none";

        document.querySelector("#dashboard-header").style.display = "flex";
        document.querySelector("#uploads-section").style.display = "block";
        document.querySelector("#history").style.display = "block";
        document.querySelector("#feature-cards").style.display = "flex";
    }
);
// ==============================
// SUMMARY BUTTON
// ==============================


/**
 * Displays a saved or newly generated summary using the existing Summary UI.
 * Uses sanitized Markdown for the overview and text nodes for returned details.
 */
function displaySummaryData(data, materialName) {
    currentSummaryData = data;
    currentSummaryMaterialName = materialName;

    summaryStatus.textContent = "";
    summaryMaterialName.textContent = materialName;

    summaryOverview.innerHTML =
        DOMPurify.sanitize(marked.parse(data.summary || ""));

    summaryKeyConcepts.innerHTML = "";

    (Array.isArray(data.key_concepts) ? data.key_concepts : [])
        .forEach(function(concept) {
            const item = document.createElement("li");
            const term = document.createElement("strong");

            term.textContent = concept.term || "Key concept";
            item.appendChild(term);
            item.appendChild(
                document.createTextNode(
                    " — " + (concept.explanation || "")
                )
            );

            summaryKeyConcepts.appendChild(item);
        });

    summaryImportantPoints.innerHTML = "";

    (Array.isArray(data.important_points) ? data.important_points : [])
        .forEach(function(point) {
            const item = document.createElement("li");
            item.textContent = point;
            summaryImportantPoints.appendChild(item);
        });


    if (!summaryKeyConcepts.children.length) {
        summaryKeyConcepts.textContent =
            "No key concepts were returned for this material.";
    }

    if (!summaryImportantPoints.children.length) {
        summaryImportantPoints.textContent =
            "No important points were returned for this material.";
    }

    showSummaryScreen();
}

summarizeButton.addEventListener("click", async function() {
    if (isMaterialProcessing) return;

    if (!textbook.files || textbook.files.length === 0) {
        summaryStatus.textContent = "Please select a textbook first.";
        return;
    }

    const selectedFile = textbook.files[0];
    const materialId = findMaterialIdByName(selectedFile.name);

    if (!materialId) {
        summaryStatus.textContent =
            "Could not find this textbook. Please select it again.";
        return;
    }

    setMaterialProcessing(true);
    summaryStatus.textContent = "Checking for a saved summary...";
    summarizeButton.textContent = "Loading Summary...";

    try {
        // Reuse the saved summary whenever one already exists.
        const savedSummary = await getSummaryFromDatabase(materialId);

        if (
            savedSummary &&
            typeof savedSummary.summary === "string" &&
            savedSummary.summary.trim()
        ) {
            displaySummaryData(savedSummary, selectedFile.name);
            return;
        }

        // Only call the API when this textbook has no saved summary.
        summaryStatus.textContent = "Preparing your summary...";
        summarizeButton.textContent = "Generating Summary...";

        const materialText = await getMaterialTextForSummary(materialId);

        
const response = await fetch("https://avia-classroom-v1.onrender.com/summarize", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Browser-ID": getAviaBrowserId()
    },
    body: JSON.stringify({ text: materialText })
});


        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Could not generate summary.");
        }

        if (typeof data.summary !== "string" || !data.summary.trim()) {
            throw new Error("AVIA returned an invalid summary.");
        }

        // Save the complete response before displaying it.
        await saveSummaryToDatabase(materialId, data);

        displaySummaryData(data, selectedFile.name);

    } catch (error) {
        console.error("Could not load or generate summary:", error);
        summaryStatus.textContent =
            error.message || "Could not load the summary.";
    } finally {
        setMaterialProcessing(false);
        summarizeButton.textContent = "Generate Summary";
    }
});

// Return from the Summary screen to the dashboard
backFromSummary.addEventListener(
    "click",
    function() {

        summaryScreen.style.display =
            "none";

        document.querySelector(
            "#dashboard-header"
        ).style.display =
            "flex";

        document.querySelector(
            "#uploads-section"
        ).style.display =
            "block";

        document.querySelector(
            "#history"
        ).style.display =
            "block";

        document.querySelector(
            "#feature-cards"
        ).style.display =
            "flex";

    }
);


/**
 * Downloads the current saved summary as a readable PDF document.
 * This uses the existing summary and does not call the AI API.
 */
summaryDownloadButton.addEventListener("click", function() {
    if (!currentSummaryData || !currentSummaryData.summary) {
        summaryStatus.textContent = "Generate or open a summary first.";
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        summaryStatus.textContent =
            "PDF support could not load. Please check your internet connection.";
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        unit: "mm",
        format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const usableWidth = pageWidth - margin * 2;
    let y = 20;

    /**
     * Adds wrapped text and starts a new page when needed.
     */
    function addWrappedText(text, fontSize, options = {}) {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", options.bold ? "bold" : "normal");

        const lines = pdf.splitTextToSize(String(text || ""), usableWidth);
        const lineHeight = fontSize * 0.45 + 2;

        lines.forEach(function(line) {
            if (y + lineHeight > pageHeight - margin) {
                pdf.addPage();
                y = margin;
            }

            pdf.text(line, margin, y);
            y += lineHeight;
        });

        y += options.gapAfter ?? 2;
    }

    function addSectionHeading(heading) {
        y += 2;
        addWrappedText(heading, 14, { bold: true, gapAfter: 3 });
    }

    // Document title
    addWrappedText("AVIA CLASSROOM — STUDY SUMMARY", 18, {
        bold: true,
        gapAfter: 4
    });

    addWrappedText("Textbook: " + currentSummaryMaterialName, 11, {
        gapAfter: 6
    });

    addSectionHeading("Chapter Overview");
    addWrappedText(
        summaryOverview.innerText.trim(),
        11
    );

    addSectionHeading("Key Concepts");
    addWrappedText(
        summaryKeyConcepts.innerText.trim(),
        11
    );

    addSectionHeading("Important Points");
    addWrappedText(
        summaryImportantPoints.innerText.trim(),
        11
    );


    const safeFileName = currentSummaryMaterialName
        .replace(/\.[^/.]+$/, "")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .trim() || "textbook";

    pdf.save(safeFileName + "-AVIA-Summary.pdf");
});

// Start the existing quiz when the user chooses Take Quiz from Summary
summaryTakeQuiz.addEventListener(
    "click",
    function() {

        summaryScreen.style.display =
            "none";

        startQuiz();

    }
);

// Open the Flash Deck directly from the Summary screen
summaryCreateFlashcards.addEventListener(
    "click",
    function() {

        flashcardButton.click();

    }
);

// ==============================
// QUIZ QUESTIONS
// ==============================

let questions = [

    {
        question:
            "What is the basic unit of life?",

        answers:
            ["Cell", "Atom", "Organ", "Tissue"],

        correct:
            "Cell",

        explanation:
            "The cell is the basic structural and functional unit of all living organisms."
    },

    {
        question:
            "Which organelle is known as the powerhouse of the cell?",

        answers:
            ["Nucleus", "Mitochondria", "Ribosome", "Cell wall"],

        correct:
            "Mitochondria",

        explanation:
            "Mitochondria produce most of the energy that cells use to perform their functions."
    },

    {
        question:
            "What carries genetic information in a cell?",

        answers:
            ["DNA", "Water", "Protein", "Glucose"],

        correct:
            "DNA",

        explanation:
            "DNA stores the genetic instructions that control the development and functioning of living organisms."
    }
];


// ==============================
// QUIZ VARIABLES
// ==============================

let currentQuestion = 0;

let score = 0;

let userAnswers = [];


// ==============================
// QUIZ ELEMENTS
// ==============================

let questionNumber =
    document.querySelector("#question-number");

let questionText =
    document.querySelector("#question-text");

let answerOptions =
    document.querySelector("#answer-options");

let nextQuestion =
    document.querySelector("#next-question");

let quizContent =
    document.querySelector("#quiz-content");

let quizResult =
    document.querySelector("#quiz-result");


// Result elements

let finalScore =
    document.querySelector("#final-score");

let finalPercentage =
    document.querySelector("#final-percentage");

let correctAnswers =
    document.querySelector("#correct-answers");

let wrongAnswers =
    document.querySelector("#wrong-answers");

let resultMessage =
    document.querySelector("#result-message");

let tryAgain =
    document.querySelector("#try-again");

let resultDashboard =
    document.querySelector("#result-dashboard");

let reviewAnswers =
    document.querySelector("#review-answers");

let shareWhatsapp =
    document.querySelector("#share-whatsapp");

let downloadScoreCard =
    document.querySelector("#download-score-card");



// ==============================
// HIDE QUIZ ON LOAD
// ==============================

quizSection.style.display =
    "none";

document.querySelector(
    "#quiz-history"
).style.display =
    "none";
    // ==============================
// SHOW QUESTION
// ==============================

function showQuestion() {

    let question =
        questions[currentQuestion];


    questionNumber.textContent =
        "Question " +
        (currentQuestion + 1) +
        " of " +
        questions.length;


    questionText.textContent =
        question.question;


    answerOptions.innerHTML =
        "";


    question.answers.forEach(function(answer) {

        let answerButton =
            document.createElement("button");


        answerButton.type =
            "button";


        answerButton.textContent =
            answer;


        answerButton.addEventListener(
            "click",
            function() {

                let allButtons =
                    answerOptions.querySelectorAll("button");


                // Reset all answers

                allButtons.forEach(function(button) {

                    button.style.backgroundColor =
                        "#f5f5f5";

                    button.style.color =
                        "black";

                    delete button.dataset.selected;
                });


                // Select clicked answer

                answerButton.style.backgroundColor =
                    "#16324f";

                answerButton.style.color =
                    "white";

                answerButton.dataset.selected =
                    "true";
            }
        );


        answerOptions.appendChild(
            answerButton
        );
    });
}


// ==============================
// START QUIZ
// ==============================


/**
 * Loads quiz questions from the selected textbook, then starts the quiz.
 * Prevents the quiz from starting if material retrieval or generation fails.
 */


/**
 * Generates a quiz from the selected textbook while sharing the processing
 * lock with Summary and Flash Deck.
 */
async function startQuiz() {
    // Prevent overlapping AI study tasks.
    if (isMaterialProcessing) return;

    if (!textbook.files || textbook.files.length === 0) {
        quizStatus.textContent = "Please select a textbook first.";
        return;
    }

    const selectedFile = textbook.files[0];
    const materialId = findMaterialIdByName(selectedFile.name);

    if (!materialId) {
        quizStatus.textContent =
            "Could not find this textbook in your saved materials. Please select it again.";
        return;
    }

    selectedMaterialId = materialId;
    setMaterialProcessing(true);
    quizStatus.textContent = "Preparing your quiz...";

    try {
        
let savedQuestions =
await getGeneratedStudyDataFromDatabase(materialId, "quiz");

// Regenerate older saved quizzes that contain fewer than 15 questions.
if (!Array.isArray(savedQuestions) || savedQuestions.length < 15) {
const materialText = await getMaterialTextForSummary(materialId);

if (typeof materialText !== "string" || materialText.trim().length < 100) {
    throw new Error(
        "This textbook does not contain enough extracted text. Please upload it again."
    );
}

const response = await fetch("https://avia-classroom-v1.onrender.com/quiz", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Browser-ID": getAviaBrowserId()
    },
    body: JSON.stringify({ text: materialText })
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.detail || "AVIA could not generate your quiz.");
}

// Accept a quiz only when all 15 questions are returned.
if (!Array.isArray(data.questions) || data.questions.length !== 15) {
    throw new Error("AVIA returned an incomplete quiz. Please try again.");
}
for (const item of data.questions) {
    if (
        !item ||
        typeof item.question !== "string" ||
        !Array.isArray(item.answers) ||
        item.answers.length !== 4 ||
        typeof item.correct !== "string" ||
        !item.answers.includes(item.correct) ||
        typeof item.explanation !== "string"
    ) {
        throw new Error("AVIA returned an incomplete quiz.");
    }
}

savedQuestions = data.questions;

await saveGeneratedStudyDataToDatabase(
    materialId,
    "quiz",
    savedQuestions
);

quizStatus.textContent = "Quiz generated and saved.";
} else {
quizStatus.textContent =
    "Loaded your saved quiz — no new AI request.";
}

questions = savedQuestions;
        currentQuestion = 0;
        score = 0;
        userAnswers = [];

        quizContent.style.display = "block";
        quizResult.style.display = "none";
        nextQuestion.style.display = "block";

        document.querySelector("#dashboard-header").style.display = "none";
        document.querySelector("#uploads-section").style.display = "none";
        document.querySelector("#history").style.display = "none";
        document.querySelector("#feature-cards").style.display = "none";

        quizSection.style.display = "block";
        quizStatus.textContent = "";

        showQuestion();

    } catch (error) {
        console.error("Quiz generation failed:", error);
        quizStatus.textContent =
            error.message || "Could not prepare your quiz. Please try again.";
    } finally {
        // Always release the shared lock after success or failure.
        setMaterialProcessing(false);
    }
}
// Start the quiz when the dashboard Start Quiz button is clicked
button.addEventListener(
    "click",
    startQuiz
);

// ==============================
// NEXT QUESTION
// ==============================

nextQuestion.addEventListener(
    "click",
    function() {

        let selectedButton =
            answerOptions.querySelector(
                'button[data-selected="true"]'
            );


        // Make sure answer was selected

        if (!selectedButton) {

            alert(
                "Please select an answer first."
            );

            return;
        }


        let selectedAnswer =
            selectedButton.textContent;


        let correctAnswer =
            questions[currentQuestion].correct;


        // Save student's answer

        userAnswers.push({

            question:
                questions[currentQuestion].question,

            selected:
                selectedAnswer,

            correct:
                correctAnswer,

            explanation:
                questions[currentQuestion].explanation
        });


        // Check answer

        if (
            selectedAnswer ===
            correctAnswer
        ) {

            score++;
        }


        // Move to next question

        currentQuestion++;


        // More questions remain

        if (
            currentQuestion <
            questions.length
        ) {

            showQuestion();

        } else {

            showQuizResult();
        }
    }
);


// ==============================
// SHOW QUIZ RESULT
// ==============================

function showQuizResult() {

    let totalQuestions =
        questions.length;


    let percentage =
        Math.round(
            (score / totalQuestions) * 100
        );


    // Get saved student name

    let savedStudentName =
        localStorage.getItem("studentName");


    let name =
        savedStudentName || "Student";


    // Hide questions

    quizContent.style.display =
        "none";


    // Show result

    quizResult.style.display =
        "block";


    // Score

    finalScore.textContent =
        score +
        "/" +
        totalQuestions;


    finalPercentage.textContent =
        percentage +
        "%";


    // Correct / wrong

    correctAnswers.textContent =
        score;

    wrongAnswers.textContent =
        totalQuestions - score;


    // Personalized message

    if (percentage === 100) {

        resultMessage.textContent =
            "Perfect score, " +
            name +
            "! Excellent work! 🔥";

    } else if (percentage >= 70) {

        resultMessage.textContent =
            "Great job, " +
            name +
            "! Keep pushing! 💪";

    } else if (percentage >= 50) {

        resultMessage.textContent =
            "Good effort, " +
            name +
            "! A little more practice will help. 📚";

    } else {

        resultMessage.textContent =
            "Keep studying, " +
            name +
            "! You can improve on your next attempt. 🧠";
    }


  // Save quiz result

saveQuizHistory();


// Generate answer review

generateReview();

setTimeout(function() {
    generateScoreCard();
}, 100);
}

// ==============================
// GENERATE ANSWER REVIEW
// ==============================

function generateReview() {

    reviewAnswers.innerHTML =
        "";


    userAnswers.forEach(
        function(answer, index) {

            let reviewItem =
                document.createElement("div");


            let isCorrect =
                answer.selected ===
                answer.correct;


            reviewItem.classList.add(
                "review-item"
            );


            if (isCorrect) {

                reviewItem.classList.add(
                    "correct"
                );

            } else {

                reviewItem.classList.add(
                    "wrong"
                );
            }


            reviewItem.innerHTML = `

                <div class="review-question">
                    ${index + 1}. ${answer.question}
                </div>

                <p class="review-answer">
                    Your answer:
                    <span class="${
                        isCorrect
                            ? "correct-text"
                            : "wrong-text"
                    }">
                        ${answer.selected}
                    </span>
                </p>

                <p class="review-answer">
                    Correct answer:
                    <span class="correct-text">
                        ${answer.correct}
                    </span>
                </p>

                <div class="review-explanation">
                    <strong>💡 Why?</strong>
                    ${answer.explanation}
                </div>

            `;


            reviewAnswers.appendChild(
                reviewItem
            );
        }
    );
}

function generateScoreCard(result = null) {

    scoreCardCanvas =
        document.getElementById("score-card-canvas");

    console.log(
        "Score card canvas:",
        scoreCardCanvas
    );

    if (!scoreCardCanvas) {

        console.log(
            "Score card canvas not found."
        );

        return;
    }

    const ctx =
        scoreCardCanvas.getContext("2d");
        const name =
        result
            ? result.name
            : localStorage.getItem("studentName") || "Student";
    
    const totalQuestions =
        result
            ? result.total
            : questions.length;
    
    const currentScore =
        result
            ? result.score
            : score;
    
    const percentage =
        result
            ? result.percentage
            : Math.round(
                (score / totalQuestions) * 100
            );
    ctx.clearRect(
        0,
        0,
        scoreCardCanvas.width,
        scoreCardCanvas.height
    );

    ctx.fillStyle =
        "#16324f";

    ctx.fillRect(
        0,
        0,
        scoreCardCanvas.width,
        scoreCardCanvas.height
    );

    ctx.fillStyle =
        "#38bdf8";

    ctx.fillRect(
        0,
        0,
        scoreCardCanvas.width,
        12
    );

    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 46px Arial";

    ctx.fillText(
        "Avia Classroom",
        70,
        90
    );

    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "bold 34px Arial";

// Prefer the saved textbook title, then the active upload's filename.
// Use the exact filename for a new quiz, or the saved title for a history download.
const quizTitle = result
    ? (result.subject || currentQuizTitle)
    : currentQuizTitle;

ctx.fillText(
quizTitle.toUpperCase(),
70,
155,
scoreCardCanvas.width - 140
);

    ctx.fillStyle =
        "white";

    ctx.font =
        "32px Arial";

    ctx.fillText(
        name,
        70,
        230
    );

    ctx.fillStyle =
        "#cbd5e1";

    ctx.font =
        "24px Arial";

    ctx.fillText(
        "YOUR SCORE",
        70,
        285
    );

    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 80px Arial";

        ctx.fillText(
            currentScore + "/" + totalQuestions,
            70,
            385
        );

    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "bold 52px Arial";

    ctx.fillText(
        percentage + "%",
        390,
        380
    );

    let message;

    if (percentage === 100) {

        message =
            "Perfect score! Excellent work!";

    } else if (percentage >= 70) {

        message =
            "Great job! Keep pushing!";

    } else if (percentage >= 50) {

        message =
            "Good effort! Keep practicing.";

    } else {

        message =
            "Keep studying! You can improve.";
    }

    ctx.fillStyle =
        "white";

    ctx.font =
        "28px Arial";

    ctx.fillText(
        message,
        70,
        470
    );

    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "bold 30px Arial";

    ctx.fillText(
        "Can you beat him?",
        760,
        470
    );

    ctx.fillStyle =
        "#cbd5e1";

    ctx.font =
        "22px Arial";

    ctx.fillText(
        "Keep learning. Keep improving.",
        70,
        555
    );
}

// ==============================
// SAVE QUIZ HISTORY
// ==============================

function saveQuizHistory() {

    let savedHistory =
        JSON.parse(
            localStorage.getItem("quizHistory")
        ) || [];

    let totalQuestions =
        questions.length;

    let percentage =
        Math.round(
            (score / totalQuestions) * 100
        );

    let savedStudentName =
        localStorage.getItem("studentName");

    let name =
        savedStudentName || "Student";

    let quizResult = {

        name:
            name,

            subject:
            currentQuizTitle,

        score:
            score,

        total:
            totalQuestions,

        percentage:
            percentage,

        date:
            new Date().toLocaleDateString()
    };


    savedHistory.unshift(
        quizResult
    );


    localStorage.setItem(
        "quizHistory",
        JSON.stringify(savedHistory)
    );
}
displayQuizHistory();
// ==============================
// DISPLAY QUIZ HISTORY
// ==============================

function displayQuizHistory() {

    let savedHistory =
        JSON.parse(
            localStorage.getItem("quizHistory")
        ) || [];

    quizHistoryList.innerHTML = "";

    if (savedHistory.length === 0) {

        quizHistoryList.innerHTML = `
            <p id="no-quiz-history">
                No quiz attempts yet.
            </p>
        `;

        return;
    }

    savedHistory.forEach(function(result) {

        let historyItem =
            document.createElement("div");

        historyItem.classList.add(
            "quiz-history-item"
        );

        historyItem.innerHTML = `
            <div>
                <strong>
                    ${result.subject} Quiz
                </strong>

                <span>
                    ${result.score}/${result.total}
                    •
                    ${result.percentage}%
                </span>

                <span>
                    ${result.date}
                </span>

                <button type="button" class="download-history-score">
                    ⬇️ Download Score Card
                </button>
            </div>
        `;

        quizHistoryList.appendChild(
            historyItem
        );

        let downloadButton =
            historyItem.querySelector(
                ".download-history-score"
            );

        downloadButton.addEventListener(
            "click",
            function() {

                downloadHistoryScoreCard(
                    result
                );

            }
        );

    });
}


function downloadHistoryScoreCard(result) {

    generateScoreCard(result);

    let link =
        document.createElement("a");

    link.download =
        result.subject +
        "-Quiz-" +
        result.date.replace(/\//g, "-") +
        ".png";

    link.href =
        scoreCardCanvas.toDataURL(
            "image/png"
        );

    link.click();

}
// ==============================
// CLEAR QUIZ HISTORY
// ==============================

clearQuizHistory.addEventListener("click", function() {

    localStorage.removeItem("quizHistory");

    displayQuizHistory();

});
// ==============================
// TRY AGAIN
// ==============================

tryAgain.addEventListener(
    "click",
    function() {

        currentQuestion = 0;

        score = 0;

        userAnswers = [];


        quizContent.style.display =
            "block";

        quizResult.style.display =
            "none";

        nextQuestion.style.display =
            "block";


        showQuestion();
    }
);


// ==============================
// BACK TO DASHBOARD
// ==============================

backDashboard.addEventListener(
    "click",
    function() {

        quizSection.style.display =
            "none";


        document.querySelector(
            "#dashboard-header"
        ).style.display =
            "flex";


        document.querySelector(
            "#uploads-section"
        ).style.display =
            "block";


        document.querySelector(
            "#history"
        ).style.display =
            "block";


        document.querySelector(
            "#feature-cards"
        ).style.display =
            "flex";
    }
);

openQuizHistory.addEventListener(
    "click",
    function() {

        quizSection.style.display =
            "none";

        document.querySelector(
            "#quiz-history"
        ).style.display =
            "block";

        displayQuizHistory();

    }
);

// Return from Quiz History to the quiz screen
historyBackDashboard.addEventListener(
    "click",
    function() {

        document.querySelector(
            "#quiz-history"
        ).style.display =
            "none";

        document.querySelector(
            "#quiz-section"
        ).style.display =
            "block";

    }
);
// ==============================
// RESULT → DASHBOARD
// ==============================

resultDashboard.addEventListener(
    "click",
    function() {

        quizSection.style.display =
            "none";


        document.querySelector(
            "#dashboard-header"
        ).style.display =
            "flex";


        document.querySelector(
            "#uploads-section"
        ).style.display =
            "block";


        document.querySelector(
            "#history"
        ).style.display =
            "block";


        document.querySelector(
            "#feature-cards"
        ).style.display =
            "flex";
    }
);


// ==============================
// SHARE SCORE ON WHATSAPP
// ==============================


/**
 * Shares the student's completed quiz score through WhatsApp.
 * The student can review the message and choose who receives it.
 */
shareWhatsapp.addEventListener("click", function() {
    const savedStudentName = localStorage.getItem("studentName");
    const name = savedStudentName || "Student";

    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
        alert("There is no completed quiz score to share.");
        return;
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    const classroomLink = "https://avia-classroom-v1.vercel.app/";

    const message =
        "🎓 " + name + " just completed a quiz on AVIA Classroom!\n\n" +
        "My score: " + score + "/" + totalQuestions +
        " (" + percentage + "%)\n\n" +
        "I'm improving my learning with AVIA Classroom!\n\n" +
        "Try AVIA Classroom: " + classroomLink;

        const whatsappURL =
        "https://wa.me/?text=" + encodeURIComponent(message);
    
    window.location.href = whatsappURL;
});
// ==============================
// DOWNLOAD SCORE CARD
// ==============================

downloadScoreCard.addEventListener(
    "click",
    function() {

        if (!scoreCardCanvas) {

            alert(
                "Score card is not available."
            );

            return;
        }

        scoreCardCanvas.toBlob(
            function(blob) {

                if (!blob) {

                    alert(
                        "Could not create the score card image."
                    );

                    return;
                }

                const imageURL =
                    URL.createObjectURL(blob);

                const downloadLink =
                    document.createElement("a");

                downloadLink.href =
                    imageURL;

                downloadLink.download =
                    "studybuddy-score.png";

                downloadLink.click();

                URL.revokeObjectURL(
                    imageURL
                );

            },
            "image/png"
        );
    }
);
// ==============================
// TEXTBOOK SELECTION
// ==============================


textbook.addEventListener("change", async function () {
    if (!textbook.files || textbook.files.length === 0) {
        fileName.textContent = "No textbook selected.";
        return;
    }

   // Capture the selected file before starting asynchronous work.
const selectedFile = textbook.files[0];

// Reject oversized files before saving history or sending a request.
const MAX_TEXTBOOK_SIZE = 20 * 1024 * 1024;

if (selectedFile.size > MAX_TEXTBOOK_SIZE) {
    const errorMessage =
        "This textbook exceeds AVIA Classroom's 20 MB upload limit. Please choose a smaller file.";

    fileName.textContent = errorMessage;
    summaryStatus.textContent = errorMessage;
    flashcardStatus.textContent = errorMessage;
    quizStatus.textContent = errorMessage;

    textbook.value = "";
    return;
}

// Preserve the exact uploaded filename for the quiz and score card.
currentQuizTitle = selectedFile.name;
    
    // Do not let study actions run before extraction is complete.
    setMaterialProcessing(true);
    fileName.textContent = `Preparing ${selectedFile.name}...`;
summaryStatus.textContent = "Preparing your textbook. Summary will be available shortly.";
flashcardStatus.textContent = "Preparing your textbook. Flashcards will be available shortly.";
quizStatus.textContent = "Preparing your textbook. Your quiz will be available shortly.";

    const materialId = saveMaterialToHistory(selectedFile);
    selectedMaterialId = materialId;

    try {
        fileName.textContent = `Preparing ${selectedFile.name}...`;

        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch(
            "https://avia-classroom-v1.onrender.com/materials/upload",
            {
                method: "POST",
                body: formData
            }
        );

        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error("AVIA returned an unreadable upload response. Please try again.");
        }

        if (!response.ok) {
            throw new Error(
                data.detail || "AVIA could not process this textbook. Please try again."
            );
        }

        if (typeof data.text !== "string" || data.text.trim().length < 100) {
            throw new Error(
                "AVIA could not extract enough readable text from this textbook. Try another file."
            );
        }

        await saveExtractedTextToDatabase(materialId, data.text);

        const savedText = await getExtractedTextFromDatabase(materialId);

        if (typeof savedText !== "string" || savedText.trim().length < 100) {
            throw new Error(
                "The extracted text could not be verified in local storage. Please upload again."
            );
        }

        console.log(
            "Extracted textbook text is ready:",
            savedText.length,
            "characters"
        );

        fileName.textContent = selectedFile.name;

summaryStatus.textContent = "Your textbook is ready. You can now generate a summary.";
flashcardStatus.textContent = "Your textbook is ready. You can now create flashcards.";
quizStatus.textContent = "Your textbook is ready. You can now start a quiz.";
    } catch (error) {
        console.error("Could not process material:", error);
    
        const errorMessage =
            error.message || "Could not process this textbook. Please try again.";
    
            fileName.textContent = errorMessage;
            summaryStatus.textContent = errorMessage;
            flashcardStatus.textContent = errorMessage;
            quizStatus.textContent = errorMessage;
    } finally {
        // Always unlock the study actions, even if extraction fails.
        setMaterialProcessing(false);
    }
});
// ==============================
// SAVE MATERIAL TO HISTORY
// ==============================

function saveMaterialToHistory(file) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "studyMaterials"
            )
        ) || [];


    let material = {

        id:
            Date.now().toString(),

        name:
            file.name,

        type:
            file.name
                .split(".")
                .pop()
                .toUpperCase()

    };


    history.unshift(
        material
    );

    saveFileToDatabase(
        file,
        material.id
    );


    localStorage.setItem(
        "studyMaterials",
        JSON.stringify(history)
    );


    // Add material to the screen
    addRecentMaterial(
        material
    );

    return material.id;
}


// Find a saved study material by its file name
function findMaterialIdByName(
    fileName
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "studyMaterials"
            )
        ) || [];

    let material =
        history.find(
            function(item) {

                return item.name === fileName;

            }
        );

    if (!material) {

        console.error(
            "Material not found in study history."
        );

        return null;
    }

    return material.id;
}



/**
 * Saves extracted textbook text into its existing IndexedDB record.
 * Resolves only after the database confirms the save succeeded.
 */
function saveExtractedTextToDatabase(materialId, extractedText) {
    return new Promise(function(resolve, reject) {
        if (!studyDatabase) {
            reject(new Error("Database is not ready."));
            return;
        }

        if (
            typeof extractedText !== "string" ||
            !extractedText.trim()
        ) {
            reject(new Error("The uploaded textbook contains no extracted text."));
            return;
        }

        let transaction;

        try {
            transaction = studyDatabase.transaction(
                "studyFiles",
                "readwrite"
            );

            const store = transaction.objectStore("studyFiles");
            const request = store.get(materialId);

            request.addEventListener("success", function() {
                const fileData = request.result;

                if (!fileData) {
                    reject(new Error("Material not found in IndexedDB."));
                    return;
                }

                fileData.text = extractedText;
                store.put(fileData);
            });

            transaction.addEventListener("complete", function() {
                resolve();
            });

            transaction.addEventListener("error", function() {
                reject(new Error("Could not save extracted textbook text."));
            });

            transaction.addEventListener("abort", function() {
                reject(new Error("Saving textbook text was cancelled."));
            });
        } catch (error) {
            reject(error);
        }
    });
}


/**
 * Retrieves the extracted textbook text from IndexedDB.
 * Resolves with the text or rejects if it cannot be retrieved.
 */
function getExtractedTextFromDatabase(materialId) {
    return new Promise(function(resolve, reject) {
        if (!studyDatabase) {
            reject(new Error("Database is not ready."));
            return;
        }

        const transaction = studyDatabase.transaction(
            "studyFiles",
            "readonly"
        );

        const store = transaction.objectStore("studyFiles");
        const request = store.get(materialId);

        request.addEventListener("success", function() {
            const fileData = request.result;

            if (!fileData || typeof fileData.text !== "string" || !fileData.text.trim()) {
                reject(new Error("No extracted textbook text was found."));
                return;
            }

            resolve(fileData.text);
        });

        request.addEventListener("error", function() {
            reject(new Error("Could not retrieve the textbook text."));
        });

        transaction.addEventListener("error", function() {
            reject(new Error("The database transaction failed."));
        });
    });
}

// Retrieve study material text and return it to another part of the app
function getMaterialTextForSummary(
    materialId
) {

    return new Promise(
        function(resolve, reject) {

            if (!studyDatabase) {

                reject(
                    "Database is not ready yet."
                );

                return;
            }

            let transaction =
                studyDatabase.transaction(
                    "studyFiles",
                    "readonly"
                );

            let store =
                transaction.objectStore(
                    "studyFiles"
                );

            let request =
                store.get(materialId);

            request.addEventListener(
                "success",
                function() {

                    let fileData =
                        request.result;

                    if (!fileData) {

                        reject(
                            "Material not found in IndexedDB."
                        );

                        return;
                    }

                    if (!fileData.text) {

                        reject(
                            "No extracted text found."
                        );

                        return;
                    }

                    resolve(
                        fileData.text
                    );

                }
            );

            request.addEventListener(
                "error",
                function() {

                    reject(
                        "Could not retrieve material text."
                    );

                }
            );

        }
    );
}


/**
 * Saves the generated summary inside the existing textbook record.
 * This avoids creating another API request when the student revisits it.
 */
function saveSummaryToDatabase(materialId, summaryData) {
    return new Promise(function(resolve, reject) {
        if (!studyDatabase) {
            reject(new Error("Database is not ready."));
            return;
        }

        let transaction;

        try {
            transaction = studyDatabase.transaction(
                "studyFiles",
                "readwrite"
            );

            const store = transaction.objectStore("studyFiles");
            const request = store.get(materialId);

            request.addEventListener("success", function() {
                const fileData = request.result;

                if (!fileData) {
                    transaction.abort();
                    reject(new Error("Textbook record was not found."));
                    return;
                }

                fileData.summary = summaryData;
                store.put(fileData);
            });

            transaction.addEventListener("complete", function() {
                resolve();
            });

            transaction.addEventListener("error", function() {
                reject(new Error("Could not save the summary."));
            });

            transaction.addEventListener("abort", function() {
                reject(new Error("Saving the summary was cancelled."));
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Retrieves a previously saved summary without contacting the AI API.
 * Returns null when the textbook has no saved summary yet.
 */
function getSummaryFromDatabase(materialId) {
    return new Promise(function(resolve, reject) {
        if (!studyDatabase) {
            reject(new Error("Database is not ready."));
            return;
        }

        try {
            const transaction = studyDatabase.transaction(
                "studyFiles",
                "readonly"
            );

            const store = transaction.objectStore("studyFiles");
            const request = store.get(materialId);

            request.addEventListener("success", function() {
                const fileData = request.result;
                resolve(fileData?.summary || null);
            });

            request.addEventListener("error", function() {
                reject(new Error("Could not retrieve the saved summary."));
            });

            transaction.addEventListener("error", function() {
                reject(new Error("The database transaction failed."));
            });
        } catch (error) {
            reject(error);
        }
    });
}



/**
 * Saves generated study content to the existing textbook record.
 * The fieldName must be "flashcards" or "quiz".
 */
function saveGeneratedStudyDataToDatabase(materialId, fieldName, data) {
    return new Promise(function(resolve, reject) {
        if (!studyDatabase) {
            reject(new Error("Database is not ready."));
            return;
        }

        if (!["flashcards", "quiz"].includes(fieldName)) {
            reject(new Error("Invalid study content type."));
            return;
        }

        try {
            const transaction = studyDatabase.transaction(
                "studyFiles",
                "readwrite"
            );

            const store = transaction.objectStore("studyFiles");
            const request = store.get(materialId);

            request.addEventListener("success", function() {
                const fileData = request.result;

                if (!fileData) {
                    transaction.abort();
                    return;
                }

                fileData[fieldName] = data;
                store.put(fileData);
            });

            transaction.addEventListener("complete", function() {
                resolve();
            });

            transaction.addEventListener("error", function() {
                reject(new Error("Could not save the generated study content."));
            });

            transaction.addEventListener("abort", function() {
                reject(new Error("Saving the study content was cancelled."));
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Retrieves saved flashcards or quiz questions without calling the AI API.
 * Returns null when no saved content exists for that textbook.
 */
function getGeneratedStudyDataFromDatabase(materialId, fieldName) {
    return new Promise(function(resolve, reject) {
        if (!studyDatabase) {
            reject(new Error("Database is not ready."));
            return;
        }

        if (!["flashcards", "quiz"].includes(fieldName)) {
            reject(new Error("Invalid study content type."));
            return;
        }

        try {
            const transaction = studyDatabase.transaction(
                "studyFiles",
                "readonly"
            );

            const store = transaction.objectStore("studyFiles");
            const request = store.get(materialId);

            request.addEventListener("success", function() {
                const fileData = request.result;
                resolve(fileData?.[fieldName] || null);
            });

            request.addEventListener("error", function() {
                reject(new Error("Could not retrieve saved study content."));
            });
        } catch (error) {
            reject(error);
        }
    });
}


// ==============================
// ADD MATERIAL TO RECENT STUDY MATERIALS
// ==============================

function addRecentMaterial(material) {

    let materialsList =
        document.querySelector(
            "#materials-list"
        );


    let materialItem =
        document.createElement(
            "div"
        );


    materialItem.classList.add(
        "material-item"
    );


    // Store the material ID
    materialItem.dataset.id =
        material.id;


   
        materialItem.innerHTML = `
        <div class="material-info">
            <strong class="material-name">
                ${material.name}
            </strong>

            <span>
                ${material.type} • Ready
            </span>
        </div>

        <div class="material-actions">
            <button
                type="button"
                class="open-material"
            >
                Open
            </button>

            <button
                type="button"
                class="delete-material"
            >
                Delete
            </button>
        </div>
    `;


    // ==============================
    // DELETE MATERIAL
    // ==============================
    let openButton =
    materialItem.querySelector(
        ".open-material"
    );

openButton.addEventListener(
    "click",
    function() {

        openFileFromDatabase(
            material.id
        );

    }
);


let deleteButton =
    materialItem.querySelector(
        ".delete-material"
    );

    deleteButton.addEventListener(
        "click",
        function() {
    
            console.log(
                "Dashboard delete button clicked:",
                material.name
            );
    
            // Ask the student to confirm deletion using Avia's own confirmation dialog
         let confirmDelete =
         window.confirm(
         "Delete this study material?"
      );

        console.log(
         "Delete confirmation result:",
          confirmDelete
        );

         if (!confirmDelete) {
          return;
}
    
            // Remove the material from the dashboard screen
             materialItem.remove();

           console.log(
           "Material removed from dashboard:",
              material.name
                       );    

             // Delete the actual uploaded file from IndexedDB
                deleteFileFromDatabase(material.id);
    
            // Get saved history
            let history =
                JSON.parse(
                    localStorage.getItem(
                        "studyMaterials"
                    )
                ) || [];


            // Remove material using its ID
            history =
                history.filter(
                    function(savedMaterial) {

                        return (
                            savedMaterial.id !==
                            material.id
                        );

                    }
                );


            // Save updated history
            localStorage.setItem(
                "studyMaterials",
                JSON.stringify(
                    history
                )
            );

        }
    );


    // Add newest material to the top
    materialsList.prepend(
        materialItem
    );
}


// ==============================
// LOAD RECENT MATERIAL HISTORY
// ==============================

function loadMaterialHistory() {

    let materialsList =
        document.querySelector(
            "#materials-list"
        );

    materialsList.innerHTML = "";

    let history =
        JSON.parse(
            localStorage.getItem(
                "studyMaterials"
            )
        ) || [];


    // Show only the 2 most recent materials
    let recentMaterials =
        history.slice(0, 2);


    recentMaterials.forEach(
        function(material) {

            addRecentMaterial(
                material
            );

        }
    );
}
// ==============================
// LOAD ALL MATERIALS LIBRARY
// ==============================

function loadAllMaterials() {

    allMaterialsList.innerHTML = "";

    let history =
        JSON.parse(
            localStorage.getItem(
                "studyMaterials"
            )
        ) || [];


    if (history.length === 0) {

        allMaterialsList.innerHTML = `
            <p>
                No study materials uploaded yet.
            </p>
        `;

        return;
    }


    history.forEach(
        function(material) {

            let materialItem =
                document.createElement(
                    "div"
                );

            materialItem.classList.add(
                "library-material-item"
            );


            materialItem.innerHTML = `

                <div class="library-material-info">

                    <strong>
                        ${material.name}
                    </strong>

                    <span>
                        ${material.type} • Ready
                    </span>

                </div>


                <div class="library-material-actions">

                    <button
                        type="button"
                        class="library-open-material"
                    >
                        Open
                    </button>

                    <button
                        type="button"
                        class="library-delete-material"
                    >
                        Delete
                    </button>

                </div>

            `;


            let openButton =
                materialItem.querySelector(
                    ".library-open-material"
                );


            openButton.addEventListener(
                "click",
                function() {

                    openFileFromDatabase(
                        material.id
                    );

                }
            );


            let deleteButton =
                materialItem.querySelector(
                    ".library-delete-material"
                );


            deleteButton.addEventListener(
                "click",
                function() {

                    materialItem.remove();


                    let updatedHistory =
                        JSON.parse(
                            localStorage.getItem(
                                "studyMaterials"
                            )
                        ) || [];


                    updatedHistory =
                        updatedHistory.filter(
                            function(savedMaterial) {

                                return (
                                    savedMaterial.id !==
                                    material.id
                                );

                            }
                        );


                    localStorage.setItem(
                        "studyMaterials",
                        JSON.stringify(
                            updatedHistory
                        )
                    );

                }
            );


            allMaterialsList.appendChild(
                materialItem
            );

        }
    );
}

// ==============================
// STUDY MATERIALS NAVIGATION
// ==============================

viewAllMaterials.addEventListener(
    "click",
    function() {

        document.querySelector(
            "#dashboard-header"
        ).style.display = "none";

        document.querySelector(
            "#uploads-section"
        ).style.display = "none";

        document.querySelector(
            "#history"
        ).style.display = "none";

        document.querySelector(
            "#feature-cards"
        ).style.display = "none";

        aviaChatSection.style.display = "none";

        materialsLibrary.style.display =
            "block";

        loadAllMaterials();

    }
);


materialsBackDashboard.addEventListener(
    "click",
    function() {

        materialsLibrary.style.display =
            "none";

        document.querySelector(
            "#dashboard-header"
        ).style.display = "";

        document.querySelector(
            "#uploads-section"
        ).style.display = "";

        document.querySelector(
            "#history"
        ).style.display = "";

        document.querySelector(
            "#feature-cards"
        ).style.display = "";

    }
);


// ==============================
// REMOVE TEXTBOOK
// ==============================

let removeFile =
    document.querySelector(
        "#removeFile"
    );


removeFile.addEventListener(
    "click",
    function() {

        textbook.value =
            "";

        fileName.textContent =
            "No textbook selected.";

    }
);

// ==============================
// LOAD FIRST QUESTION
// ==============================

// =========================
// AVIA CHAT NAVIGATION
// =========================

function showAviaChat() {

    // Hide dashboard
    document.getElementById("dashboard-header").style.display = "none";
    document.getElementById("uploads-section").style.display = "none";
    document.getElementById("history").style.display = "none";
    document.getElementById("feature-cards").style.display = "none";

    // Show AVIA chat
    aviaChatSection.style.display = "block";
}


// Connect the sidebar Dashboard link to the main dashboard
document.querySelector("#sidebar-dashboard").addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        showDashboard();
    }
);

// Open the Login / Sign Up screen from the dashboard
document.querySelector("#login-signup-button").addEventListener(
    "click",
    function() {

        // Hide the main dashboard sections
        document.querySelector("#dashboard-header").style.display = "none";
        document.querySelector("#uploads-section").style.display = "none";
        document.querySelector("#history").style.display = "none";
        document.querySelector("#feature-cards").style.display = "none";

        // Hide other major screens
        document.querySelector("#quiz-section").style.display = "none";
        document.querySelector("#quiz-history").style.display = "none";
        document.querySelector("#summaryScreen").style.display = "none";
        document.querySelector("#settings-section").style.display = "none";
        document.querySelector("#avia-chat-section").style.display = "none";
        document.querySelector("#materials-library").style.display = "none";
        flashcardScreen.style.display = "none";

        // Show the Login / Sign Up screen
        document.querySelector("#login-screen").style.display = "block";
    }
);

// Return from the Login / Sign Up screen to the dashboard
document.querySelector("#login-back-dashboard").addEventListener(
    "click",
    function() {

        // Hide the Login / Sign Up screen
        document.querySelector("#login-screen").style.display = "none";

        // Show the main dashboard
        document.querySelector("#dashboard-header").style.display = "flex";
        document.querySelector("#uploads-section").style.display = "block";
        document.querySelector("#history").style.display = "block";
        document.querySelector("#feature-cards").style.display = "flex";
    }
);



// Show the Login form and hide the account choice buttons
document.querySelector("#login-button").addEventListener(
    "click",
    function() {

        // Hide the initial Login / Sign Up choices
        document.querySelector("#login-button").style.display = "none";
        document.querySelector("#signup-button").style.display = "none";

        // Show the Login form
        document.querySelector("#login-form").style.display = "block";

        // Hide the Create Account form
        document.querySelector("#signup-form").style.display = "none";
    }
);

// Show the Create Account form and hide the account choice buttons
document.querySelector("#signup-button").addEventListener(
    "click",
    function() {

        // Hide the initial Login / Sign Up choices
        document.querySelector("#login-button").style.display = "none";
        document.querySelector("#signup-button").style.display = "none";

        // Show the Create Account form
        document.querySelector("#signup-form").style.display = "block";

        // Hide the Login form
        document.querySelector("#login-form").style.display = "none";
    }
);



// Return from the Login form to the account choices
document.querySelector("#back-to-account-options").addEventListener(
    "click",
    function() {

        // Hide the Login form
        document.querySelector("#login-form").style.display = "none";

        // Show the account choice buttons again
        document.querySelector("#login-button").style.display = "block";
        document.querySelector("#signup-button").style.display = "block";
    }
);

// Return from the Sign Up form to the account choices
document.querySelector("#back-to-account-options-signup").addEventListener(
    "click",
    function() {

        // Hide the Create Account form
        document.querySelector("#signup-form").style.display = "none";

        // Show the account choice buttons again
        document.querySelector("#login-button").style.display = "block";
        document.querySelector("#signup-button").style.display = "block";
    }


    



);
// Return the student to the main dashboard from any screen
function showDashboard() {

    // Hide AVIA Chat
    aviaChatSection.style.display = "none";

    // Hide all major screens
    document.querySelector("#quiz-section").style.display = "none";
    document.querySelector("#quiz-history").style.display = "none";
    document.querySelector("#summaryScreen").style.display = "none";
    document.querySelector("#settings-section").style.display = "none";
    document.querySelector("#materials-library").style.display = "none";
    document.querySelector("#login-screen").style.display = "none";
    flashcardScreen.style.display = "none";

    // Show the main dashboard
    document.querySelector("#dashboard-header").style.display = "flex";
    document.querySelector("#uploads-section").style.display = "block";
    document.querySelector("#history").style.display = "block";
    document.querySelector("#feature-cards").style.display = "flex";
}
// Connect the sidebar Upload Textbook link to the existing upload area
document.querySelector("#sidebar-upload").addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        // Return to the dashboard layout
        showDashboard();

        // Scroll directly to the textbook upload area
        document.querySelector("#uploads-section").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


// Show the AVIA account information popup with a custom message
function showAccountInfoPopup(title, message) {
    document.querySelector("#account-info-title").textContent = title;
    document.querySelector("#account-info-message").textContent = message;
    document.querySelector("#account-info-modal").style.display = "flex";
}

// Close the AVIA account information popup
function closeAccountInfoPopup() {
    document.querySelector("#account-info-modal").style.display = "none";
}

// Close the account popup when the X button is clicked
document.querySelector("#close-account-info").addEventListener(
    "click",
    function() {
        closeAccountInfoPopup();
    }
);

// Close the account popup when Continue is clicked
document.querySelector("#account-info-ok").addEventListener(
    "click",
    function() {
        closeAccountInfoPopup();
    }
);


// Validate the Create Account fields before showing the V1 account message
document.querySelector("#submit-signup").addEventListener(
    "click",
    function() {

        let name = document.querySelector("#signup-name").value.trim();
        let email = document.querySelector("#signup-email").value.trim();
        let password = document.querySelector("#signup-password").value.trim();

        // Stop if any required field is empty
        if (!name || !email || !password) {
            showAccountInfoPopup(
                "Complete your details",
                "Please enter your full name, email address, and password before creating your account."
            );
            return;
        }

        showAccountInfoPopup(
            "Account saved on this device",
            "Your profile can be saved locally in this version. Full account login and cloud syncing will be available in a future AVIA update."
        );
    }
);

// Show the V1 login message when a student submits the Login form
document.querySelector("#submit-login").addEventListener(
    "click",
    function() {
        showAccountInfoPopup(
            "Online login is coming soon",
            "Real account login and cloud syncing are not available in this version yet. Your current AVIA data remains stored on this device."
        );
    }
);


// Connect the sidebar Generate Flashcards link to the existing flashcard flow
document.querySelector("#sidebar-flashcards").addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        // Hide Ask AVIA before opening the Flash Deck
        aviaChatSection.style.display = "none";

        // Use the existing Create Flashcards button and its full working flow
        flashcardButton.click();
    }
);


// Close the account popup when the X button is clicked
document.querySelector("#close-account-info").addEventListener(
    "click",
    function() {
        closeAccountInfoPopup();
    }
);

// Close the account popup when Continue is clicked
document.querySelector("#account-info-ok").addEventListener(
    "click",
    function() {
        closeAccountInfoPopup();
    }
);
// Connect the sidebar Take Mock Quiz link to the existing quiz flow
document.querySelector("#sidebar-quiz").addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        // Hide Ask AVIA before opening the Quiz
        aviaChatSection.style.display = "none";

        // Hide the Flash Deck before opening the Quiz
        flashcardScreen.style.display = "none";

        // Use the existing Start Quiz button and its full working flow
        document.querySelector("#StartQuiz").click();
    }
);
// Ask AVIA button
aviaChatButton.addEventListener("click", function () {
    showAviaChat();
});


// Back to Dashboard button
aviaBackDashboard.addEventListener("click", function () {
    showDashboard();
});


 // =========================
 // AVIA CHAT FUNCTIONALITY
 // =========================
// Keeps the conversation context for the current chat session.
let aviaConversationHistory = [];
 // Creates an AVIA message using the existing logo and chat styling.
 function createAviaMessage() {
    const messageElement = document.createElement("div");
    messageElement.className = "avia-message avia-message-ai";

    const avatar = document.createElement("div");
    avatar.className = "avia-message-avatar";

    const logo = document.createElement("img");
    logo.src = "logo.png";
    logo.alt = "AVIA";
    avatar.appendChild(logo);

    const content = document.createElement("div");
    content.className = "avia-message-content";

    const label = document.createElement("strong");
    label.textContent = "AVIA";

    const text = document.createElement("div");
    text.className = "avia-message-text";

    content.appendChild(label);
    content.appendChild(text);
    messageElement.appendChild(avatar);
    messageElement.appendChild(content);

    return { messageElement, text };
}

// Sends the student's message and displays AVIA's thinking state until the reply arrives.
async function sendAviaMessage() {
    const userMessage = aviaChatInput.value.trim();

    if (userMessage === "") {
        return;
    }

    // Prevent duplicate requests while AVIA is responding.
    if (aviaSendButton.disabled) {
        return;
    }

    aviaSendButton.disabled = true;
    aviaChatInput.disabled = true;

    // Display the student's message safely.
    const userMessageElement = document.createElement("div");
    userMessageElement.className = "avia-message avia-message-user";

    const userMessageContent = document.createElement("div");
    userMessageContent.className = "avia-message-content";

    const userMessageLabel = document.createElement("strong");
    userMessageLabel.textContent = "You";

    const userMessageParagraph = document.createElement("p");
    userMessageParagraph.textContent = userMessage;

    userMessageContent.appendChild(userMessageLabel);
    userMessageContent.appendChild(userMessageParagraph);
    userMessageElement.appendChild(userMessageContent);
    aviaChatMessages.appendChild(userMessageElement);

    // Clear the input and show AVIA's logo with a thinking indicator.
    aviaChatInput.value = "";

    const aviaMessage = createAviaMessage();
    aviaMessage.text.textContent = "";

    const thinking = document.createElement("div");
    thinking.className = "avia-thinking";

    const thinkingLabel = document.createElement("span");
    thinkingLabel.textContent = "AVIA is thinking";

    const dots = document.createElement("span");
    dots.className = "avia-thinking-dots";
    dots.setAttribute("aria-hidden", "true");
    dots.textContent = "...";

    thinking.appendChild(thinkingLabel);
    thinking.appendChild(dots);
    aviaMessage.text.appendChild(thinking);

    aviaChatMessages.appendChild(aviaMessage.messageElement);
    aviaChatMessages.scrollTop = aviaChatMessages.scrollHeight;

    try {
        const response = await fetch("https://avia-classroom-v1.onrender.com/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Browser-ID": getAviaBrowserId()
            },
            body: JSON.stringify({
                message: userMessage,
                history: [
                    ...aviaConversationHistory,
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error("The chat request failed.");
        }

        const data = await response.json();

        const replyText =
            typeof data.reply === "string"
                ? data.reply
                : "AVIA couldn't provide a response.";

        // Save this exchange so follow-up questions retain their context.
              aviaConversationHistory.push(
              { role: "user", content: userMessage },
              { role: "assistant", content: replyText }
              );

        // Replace the thinking indicator with AVIA's actual response.
        aviaMessage.text.innerHTML = DOMPurify.sanitize(
            marked.parse(replyText)
        );

    } catch (error) {
        console.error("Error connecting to AVIA backend:", error);

        aviaMessage.text.textContent =
            "Sorry, AVIA couldn't respond right now. Please try again.";
    } finally {
        aviaSendButton.disabled = false;
        aviaChatInput.disabled = false;
        aviaChatMessages.scrollTop = aviaChatMessages.scrollHeight;
        aviaChatInput.focus();
    }
}

aviaSendButton.addEventListener("click", sendAviaMessage);

// Allows Enter to send a message while Shift+Enter inserts a new line.
aviaChatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        aviaSendButton.click();
    }
});

displayQuizHistory();
showQuestion();
loadMaterialHistory();


