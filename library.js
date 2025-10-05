import * as storage from "./storage.js"
import { setCurrentCapsuleId, navigateToView, afterCapsuleChange } from "./app.js"
import { addFlashcardRow, addQuizQuestion } from "./author.js"

export function renderLibrary() {
  const grid = document.getElementById("capsules-grid")
  const emptyState = document.getElementById("empty-state")
  const index = storage.getCapsulesIndex()

  if (index.length === 0) {
    grid.style.display = "none"
    emptyState.style.display = "flex"
    return
  }

  grid.style.display = "grid"
  emptyState.style.display = "none"
  grid.innerHTML = ""

  const sortedIndex = [...index].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  sortedIndex.forEach((item) => {
    const card = createCapsuleCard(item)
    grid.appendChild(card)
  })
}

function createCapsuleCard(item) {
  const card = document.createElement("div")
  card.className = "capsule-card"

  const capsule = storage.getCapsule(item.id)
  const progress = storage.getProgress(item.id)

  const flashcardsCount = capsule?.flashcards?.length || 0
  const knownCount = progress.knownFlashcards.length
  const quizScore = progress.bestScore

  const levelColors = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "danger",
  }

  card.innerHTML = `
    <div class="capsule-card-header">
      <h3 class="capsule-card-title text-balance">${escapeHtml(item.title)}</h3>
      <div class="capsule-card-meta">
        <span class="badge bg-${levelColors[item.level] || "secondary"}">${item.level}</span>
        ${item.subject ? `<span class="capsule-card-subject">${escapeHtml(item.subject)}</span>` : ""}
        <span class="capsule-card-time">${storage.timeAgo(item.updatedAt)}</span>
      </div>
    </div>
    <div class="capsule-card-stats">
      <div class="stat-item">
        <span class="stat-label">Best Quiz Score</span>
        <span class="stat-value">${quizScore}%</span>
        <div class="progress mt-2">
          <div class="progress-bar" role="progressbar" style="width: ${quizScore}%" aria-valuenow="${quizScore}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">Known Cards</span>
        <span class="stat-value">${knownCount}/${flashcardsCount}</span>
        <div class="progress mt-2">
          <div class="progress-bar" role="progressbar" style="width: ${flashcardsCount > 0 ? (knownCount / flashcardsCount) * 100 : 0}%" aria-valuenow="${knownCount}" aria-valuemin="0" aria-valuemax="${flashcardsCount}"></div>
        </div>
      </div>
    </div>
    <div class="capsule-card-actions">
      <button class="btn btn-primary btn-learn" data-id="${item.id}">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
        </svg>
        Learn
      </button>
      <button class="btn btn-outline-secondary btn-edit" data-id="${item.id}">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
        Edit
      </button>
      <button class="btn btn-outline-secondary btn-export" data-id="${item.id}">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Export
      </button>
      <button class="btn btn-outline-secondary btn-delete" data-id="${item.id}">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Delete
      </button>
    </div>
  `
  card.querySelector(".btn-learn").addEventListener("click", (e) => {
    e.stopPropagation()
    handleLearn(item.id)
  })
  card.querySelector(".btn-edit").addEventListener("click", (e) => {
    e.stopPropagation()
    handleEdit(item.id)
  })
  card.querySelector(".btn-export").addEventListener("click", (e) => {
    e.stopPropagation()
    handleExport(item.id)
  })
  card.querySelector(".btn-delete").addEventListener("click", (e) => {
    e.stopPropagation()
    handleDelete(item.id)
  })

  return card
}

function handleLearn(id) {
  setCurrentCapsuleId(id)
  navigateToView("learn")
  setTimeout(() => {
    const select = document.getElementById("learn-capsule-select")
    select.value = id
    select.dispatchEvent(new Event("change"))
  }, 100)
}

function handleEdit(id) {
  const capsule = storage.getCapsule(id)
  if (!capsule) {
    alert("Capsule not found")
    return
  }
  setCurrentCapsuleId(id)
  loadCapsuleIntoAuthor(capsule)
  navigateToView("author")
}

function handleExport(id) {
  const capsule = storage.getCapsule(id)
  if (!capsule) {
    alert("Capsule not found")
    return
  }
  storage.exportCapsule(capsule)
}

function handleDelete(id) {
  const capsule = storage.getCapsule(id)
  if (!capsule) return
  if (confirm(`Are you sure you want to delete "${capsule.meta.title}"? This cannot be undone.`)) {
    if (storage.deleteCapsule(id)) {
      afterCapsuleChange()
    } else {
      alert("Failed to delete capsule")
    }
  }
}

function loadCapsuleIntoAuthor(capsule) {
  document.getElementById("author-title").textContent = "Edit Capsule"
  document.getElementById("capsule-title").value = capsule.meta.title
  document.getElementById("capsule-subject").value = capsule.meta.subject || ""
  document.getElementById("capsule-level").value = capsule.meta.level || "Beginner"
  document.getElementById("capsule-description").value = capsule.meta.description || ""
  document.getElementById("notes-editor").value = capsule.notes.join("\n")
  const flashcardsContainer = document.getElementById("flashcards-container")
  flashcardsContainer.innerHTML = ""
  capsule.flashcards.forEach((card) => {
    addFlashcardRow(card.front, card.back)
  })
  const quizContainer = document.getElementById("quiz-container")
  quizContainer.innerHTML = ""
  capsule.quiz.forEach((question) => {
    addQuizQuestion(question)
  })
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}