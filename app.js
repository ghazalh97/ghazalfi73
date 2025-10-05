import * as storage from "./storage.js"
import { renderLibrary } from "./library.js"
import { initAuthor } from "./author.js"
import { initLearn } from "./learn.js"

// App state
let currentView = "library"
let currentCapsuleId = null

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Pocket Classroom initialized")

  initNavigation()
  initLibrary()
  initAuthor()
  initLearn()

  // Show library by default
  switchView("library")

  // Add sample data if empty (for demo purposes)
  if (storage.getCapsulesIndex().length === 0) {
    addSampleCapsule()
  }
})

function showError(message) {
  alert(message)
}

// Navigation
function initNavigation() {
  const navTabs = document.querySelectorAll(".nav-tab")

  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.view
      switchView(view)
    })
  })
}

function switchView(view) {
  // Update nav tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === view)
  })

  // Update view sections
  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.remove("active")
  })

  document.getElementById(`${view}-view`).classList.add("active")
  currentView = view

  // Refresh view content
  if (view === "library") {
    renderLibrary()
  } else if (view === "learn") {
    updateLearnCapsuleSelect()
  }
}

// Library initialization
function initLibrary() {
  const newCapsuleBtn = document.getElementById("new-capsule-btn")
  const emptyNewBtn = document.getElementById("empty-new-btn")
  const importBtn = document.getElementById("import-btn")
  const importFileInput = document.getElementById("import-file-input")

  newCapsuleBtn.addEventListener("click", () => {
    currentCapsuleId = null
    clearAuthorForm()
    switchView("author")
  })

  emptyNewBtn.addEventListener("click", () => {
    currentCapsuleId = null
    clearAuthorForm()
    switchView("author")
  })

  importBtn.addEventListener("click", () => {
    importFileInput.click()
  })

  importFileInput.addEventListener("change", handleImport)

  renderLibrary()
}

function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      const validation = storage.validateCapsule(data)

      if (!validation.valid) {
        alert(`Import failed: ${validation.error}`)
        return
      }

      // Generate new ID to avoid collisions
      const newId = storage.generateId()
      const capsule = {
        ...data,
        id: newId,
        updatedAt: new Date().toISOString(),
      }

      delete capsule.schema // Remove schema from stored data

      if (storage.saveCapsule(capsule)) {
        alert("Capsule imported successfully!")
        renderLibrary()
        updateLearnCapsuleSelect()
      } else {
        showError("Failed to save imported capsule (maybe storage is full?)")
      }
    } catch (error) {
      console.error("[v0] Import error:", error)
      alert("Failed to import capsule. Please check the file format.")
    }
  }

  reader.readAsText(file)
  event.target.value = "" // Reset input
}

function clearAuthorForm() {
  document.getElementById("capsule-title").value = ""
  document.getElementById("capsule-subject").value = ""
  document.getElementById("capsule-level").value = "Beginner"
  document.getElementById("capsule-description").value = ""
  document.getElementById("notes-editor").value = ""
  document.getElementById("flashcards-container").innerHTML = ""
  document.getElementById("quiz-container").innerHTML = ""
  document.getElementById("author-title").textContent = "New Capsule"
}

function updateLearnCapsuleSelect() {
  const select = document.getElementById("learn-capsule-select")
  const index = storage.getCapsulesIndex()

  select.innerHTML = '<option value="">Select a capsule to study...</option>'

  index.forEach((item) => {
    const option = document.createElement("option")
    option.value = item.id
    option.textContent = item.title
    select.appendChild(option)
  })
}

// Add sample capsule for demo
function addSampleCapsule() {
  const sampleCapsule = {
    id: storage.generateId(),
    meta: {
      title: "JavaScript Fundamentals",
      subject: "Programming",
      level: "Beginner",
      description: "Essential JavaScript concepts for beginners",
    },
    notes: [
      "JavaScript is a high-level, interpreted programming language",
      "Variables can be declared using let, const, or var",
      "Functions are first-class citizens in JavaScript",
      "Arrays and objects are the main data structures",
      "JavaScript supports both functional and object-oriented programming",
    ],
    flashcards: [
      {
        front: "What are the three ways to declare variables in JavaScript?",
        back: "let, const, and var",
      },
      {
        front: "What is the difference between == and ===?",
        back: "== checks for value equality with type coercion, === checks for strict equality without type coercion",
      },
      {
        front: "What is a closure in JavaScript?",
        back: "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned",
      },
    ],
    quiz: [
      {
        question: "Which keyword is used to declare a constant in JavaScript?",
        choices: ["var", "let", "const", "static"],
        correctIndex: 2,
        explanation: "The 'const' keyword is used to declare constants that cannot be reassigned.",
      },
      {
        question: "What will typeof null return?",
        choices: ["null", "undefined", "object", "number"],
        correctIndex: 2,
        explanation: "This is a known quirk in JavaScript - typeof null returns 'object' due to a legacy bug.",
      },
      {
        question: "Which method is used to add an element to the end of an array?",
        choices: ["push()", "pop()", "shift()", "unshift()"],
        correctIndex: 0,
        explanation: "The push() method adds one or more elements to the end of an array.",
      },
    ],
    updatedAt: new Date().toISOString(),
  }

  storage.saveCapsule(sampleCapsule)
  console.log("[v0] Sample capsule added")
}

// Export functions for other modules
export function getCurrentCapsuleId() {
  return currentCapsuleId
}

export function setCurrentCapsuleId(id) {
  currentCapsuleId = id
}

export function navigateToView(view) {
  switchView(view)
}

export function afterCapsuleChange() {
  renderLibrary()
  updateLearnCapsuleSelect()
}

export { renderLibrary, updateLearnCapsuleSelect }