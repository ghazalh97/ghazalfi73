import * as storage from "./storage.js"
import { getCurrentCapsuleId, setCurrentCapsuleId, navigateToView, renderLibrary, updateLearnCapsuleSelect } from "./app.js"

// Initialize author mode
export function initAuthor() {
  const saveBtn = document.getElementById("save-capsule-btn")
  const cancelBtn = document.getElementById("cancel-author-btn")
  const addFlashcardBtn = document.getElementById("add-flashcard-btn")
  const addQuestionBtn = document.getElementById("add-question-btn")

  saveBtn.addEventListener("click", () => handleSave(false))
  cancelBtn.addEventListener("click", handleCancel)
  addFlashcardBtn.addEventListener("click", () => addFlashcardRow())
  addQuestionBtn.addEventListener("click", () => addQuizQuestion())

  // Auto-save on input (debounced)
  let autoSaveTimeout
  const inputs = [
    document.getElementById("capsule-title"),
    document.getElementById("capsule-subject"),
    document.getElementById("capsule-level"),
    document.getElementById("capsule-description"),
    document.getElementById("notes-editor"),
  ]

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      clearTimeout(autoSaveTimeout)
      autoSaveTimeout = setTimeout(() => {
        handleSave(true)
      }, 2000)
    })
  })
}

// Add flashcard row
export function addFlashcardRow(front = "", back = "") {
  const container = document.getElementById("flashcards-container")
  const index = container.children.length

  const row = document.createElement("div")
  row.className = "flashcard-row"
  row.innerHTML = `
    <div class="flashcard-row-header">
      <span class="flashcard-number">Card ${index + 1}</span>
      <button type="button" class="btn-remove" aria-label="Remove flashcard">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
    <div class="row g-2">
      <div class="col-md-6">
        <input type="text" class="form-control flashcard-front" placeholder="Front (question)" value="${escapeHtml(front)}">
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control flashcard-back" placeholder="Back (answer)" value="${escapeHtml(back)}">
      </div>
    </div>
  `

  row.querySelector(".btn-remove").addEventListener("click", () => {
    row.remove()
    updateFlashcardNumbers()
  })

  container.appendChild(row)
  updateFlashcardNumbers()
}

// Add quiz question
export function addQuizQuestion(question = null) {
  const container = document.getElementById("quiz-container")
  const index = container.children.length

  const block = document.createElement("div")
  block.className = "quiz-question-block"
  block.innerHTML = `
    <div class="quiz-question-header">
      <span class="question-number">Question ${index + 1}</span>
      <button type="button" class="btn-remove" aria-label="Remove question">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
    <div class="mb-3">
      <input type="text" class="form-control question-text" placeholder="Question text" value="${question ? escapeHtml(question.question) : ""}">
    </div>
    <div class="row g-2 mb-2">
      <div class="col-md-6">
        <input type="text" class="form-control choice-input" data-choice="0" placeholder="A. First choice" value="${question ? escapeHtml(question.choices[0] || "") : ""}">
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control choice-input" data-choice="1" placeholder="B. Second choice" value="${question ? escapeHtml(question.choices[1] || "") : ""}">
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control choice-input" data-choice="2" placeholder="C. Third choice" value="${question ? escapeHtml(question.choices[2] || "") : ""}">
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control choice-input" data-choice="3" placeholder="D. Fourth choice" value="${question ? escapeHtml(question.choices[3] || "") : ""}">
      </div>
    </div>
    <div class="row g-2">
      <div class="col-md-6">
        <select class="form-select correct-answer">
          <option value="">Select correct answer</option>
          <option value="0" ${question && question.correctIndex === 0 ? "selected" : ""}>A</option>
          <option value="1" ${question && question.correctIndex === 1 ? "selected" : ""}>B</option>
          <option value="2" ${question && question.correctIndex === 2 ? "selected" : ""}>C</option>
          <option value="3" ${question && question.correctIndex === 3 ? "selected" : ""}>D</option>
        </select>
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control explanation-input" placeholder="Explanation (optional)" value="${question ? escapeHtml(question.explanation || "") : ""}">
      </div>
    </div>
  `

  block.querySelector(".btn-remove").addEventListener("click", () => {
    block.remove()
    updateQuestionNumbers()
  })

  container.appendChild(block)
  updateQuestionNumbers()
}

// Update flashcard numbers
function updateFlashcardNumbers() {
  const rows = document.querySelectorAll(".flashcard-row")
  rows.forEach((row, index) => {
    row.querySelector(".flashcard-number").textContent = `Card ${index + 1}`
  })
}

// Update question numbers
function updateQuestionNumbers() {
  const blocks = document.querySelectorAll(".quiz-question-block")
  blocks.forEach((block, index) => {
    block.querySelector(".question-number").textContent = `Question ${index + 1}`
  })
}

// Handle save
function handleSave(autosave = false) {
  const title = document.getElementById("capsule-title").value.trim()
  const subject = document.getElementById("capsule-subject").value.trim()
  const level = document.getElementById("capsule-level").value
  const description = document.getElementById("capsule-description").value.trim()

  // Validation
  if (!title) {
    if (!autosave) {
      alert("Please enter a title for your capsule")
      document.getElementById("capsule-title").focus()
    }
    return
  }

  // Collect notes
  const notesText = document.getElementById("notes-editor").value
  const notes = notesText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Collect flashcards
  const flashcardRows = document.querySelectorAll(".flashcard-row")
  const flashcards = []
  flashcardRows.forEach((row) => {
    const front = row.querySelector(".flashcard-front").value.trim()
    const back = row.querySelector(".flashcard-back").value.trim()
    if (front && back) {
      flashcards.push({ front, back })
    }
  })

  // Collect quiz questions
  const questionBlocks = document.querySelectorAll(".quiz-question-block")
  const quiz = []
  questionBlocks.forEach((block) => {
    const questionText = block.querySelector(".question-text").value.trim()
    const choices = Array.from(block.querySelectorAll(".choice-input")).map((input) => input.value.trim())
    const correctIndex = Number.parseInt(block.querySelector(".correct-answer").value)
    const explanation = block.querySelector(".explanation-input").value.trim()

    if (questionText && choices.every((c) => c) && !isNaN(correctIndex)) {
      quiz.push({
        question: questionText,
        choices,
        correctIndex,
        explanation: explanation || "",
      })
    }
  })

  // Validate content
  if (notes.length === 0 && flashcards.length === 0 && quiz.length === 0) {
    if (!autosave) alert("Please add at least one type of content (notes, flashcards, or quiz)")
    return
  }

  // Create or update capsule
  const currentId = getCurrentCapsuleId()
  const capsule = {
    id: currentId || storage.generateId(),
    meta: {
      title,
      subject,
      level,
      description,
    },
    notes,
    flashcards,
    quiz,
    updatedAt: new Date().toISOString(),
  }

  if (storage.saveCapsule(capsule)) {
    setCurrentCapsuleId(capsule.id)
    if (!autosave) {
      renderLibrary()
      updateLearnCapsuleSelect()
      navigateToView("library")
    }
  } else {
    alert("Failed to save capsule. Storage may be full.")
  }
}

// Handle cancel
function handleCancel() {
  if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
    navigateToView("library")
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}