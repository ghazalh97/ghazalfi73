import * as storage from "./storage.js"

let currentCapsule = null
let currentFlashcardIndex = 0
let isFlipped = false
let currentQuizIndex = 0
let quizAnswers = []
let quizStarted = false

// Initialize learn mode
export function initLearn() {
  const select = document.getElementById("learn-capsule-select")
  const exportBtn = document.getElementById("export-capsule-btn")
  const searchInput = document.getElementById("notes-search")

  select.addEventListener("change", handleCapsuleSelect)
  exportBtn.addEventListener("click", handleExportFromLearn)
  searchInput.addEventListener("input", handleNotesSearch)

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts)

  // Update capsule list
  updateCapsuleSelect()
}

// Update capsule select dropdown
function updateCapsuleSelect() {
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

// Handle capsule selection
function handleCapsuleSelect(event) {
  const capsuleId = event.target.value

  if (!capsuleId) {
    showEmptyState()
    return
  }

  currentCapsule = storage.getCapsule(capsuleId)

  if (!currentCapsule) {
    alert("Capsule not found")
    showEmptyState()
    return
  }

  showLearnContent()
  loadCapsuleInfo()
  loadNotes()
  loadFlashcards()
  loadQuiz()

  document.getElementById("export-capsule-btn").disabled = false
}

// Show empty state
function showEmptyState() {
  document.getElementById("learn-empty-state").style.display = "flex"
  document.getElementById("learn-tabs-container").style.display = "none"
  document.getElementById("export-capsule-btn").disabled = true
}

// Show learn content
function showLearnContent() {
  document.getElementById("learn-empty-state").style.display = "none"
  document.getElementById("learn-tabs-container").style.display = "block"
}

// Load capsule info
function loadCapsuleInfo() {
  document.getElementById("learn-capsule-title").textContent = currentCapsule.meta.title
  document.getElementById("learn-capsule-level").textContent = currentCapsule.meta.level
  document.getElementById("learn-capsule-level").className = `badge bg-${getLevelColor(currentCapsule.meta.level)}`
  document.getElementById("learn-capsule-subject").textContent = currentCapsule.meta.subject || "No subject"
}

// Get level badge color
function getLevelColor(level) {
  const colors = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "danger",
  }
  return colors[level] || "secondary"
}

// Load notes
function loadNotes() {
  const notesList = document.getElementById("notes-list")
  notesList.innerHTML = ""

  if (currentCapsule.notes.length === 0) {
    notesList.innerHTML = '<li class="text-muted">No notes available</li>'
    return
  }

  currentCapsule.notes.forEach((note) => {
    const li = document.createElement("li")
    li.textContent = note
    li.dataset.note = note.toLowerCase()
    notesList.appendChild(li)
  })
}

// Handle notes search
function handleNotesSearch(event) {
  const query = event.target.value.toLowerCase()
  const notes = document.querySelectorAll("#notes-list li")

  notes.forEach((note) => {
    const text = note.dataset.note || note.textContent.toLowerCase()
    if (text.includes(query)) {
      note.style.display = ""
    } else {
      note.style.display = "none"
    }
  })
}

// Load flashcards
function loadFlashcards() {
  const viewer = document.getElementById("flashcard-viewer")
  currentFlashcardIndex = 0
  isFlipped = false

  if (currentCapsule.flashcards.length === 0) {
    viewer.innerHTML = '<div class="empty-state"><p>No flashcards available</p></div>'
    return
  }

  renderFlashcard()
}

// Render flashcard
function renderFlashcard() {
  const viewer = document.getElementById("flashcard-viewer")
  const flashcards = currentCapsule.flashcards
  const progress = storage.getProgress(currentCapsule.id)

  if (flashcards.length === 0) return

  const card = flashcards[currentFlashcardIndex]
  const isKnown = progress.knownFlashcards.includes(currentFlashcardIndex)

  viewer.innerHTML = `
    <div class="flashcard-container">
      <div class="flashcard ${isFlipped ? "flipped" : ""}" id="flashcard">
        <span class="flashcard-label">${isFlipped ? "Back" : "Front"}</span>
        <div class="flashcard-content">
          ${isFlipped ? escapeHtml(card.back) : escapeHtml(card.front)}
        </div>
      </div>

      <div class="flashcard-controls">
        <button class="btn btn-outline-secondary" id="prev-card" ${currentFlashcardIndex === 0 ? "disabled" : ""}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Previous
        </button>
        <button class="btn btn-primary" id="flip-card">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="me-2">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          Flip (Space)
        </button>
        <button class="btn btn-outline-secondary" id="next-card" ${currentFlashcardIndex === flashcards.length - 1 ? "disabled" : ""}>
          Next
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <div class="flashcard-actions">
        <button class="btn ${isKnown ? "btn-outline-secondary" : "btn-outline-primary"}" id="mark-unknown">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="me-2">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          ${isKnown ? "Mark Unknown" : "Unknown"}
        </button>
        <button class="btn ${isKnown ? "btn-primary" : "btn-outline-primary"}" id="mark-known">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="me-2">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          ${isKnown ? "Known" : "Mark Known"}
        </button>
      </div>

      <div class="text-center mt-3">
        <span class="badge bg-secondary" id="flashcard-counter">${currentFlashcardIndex + 1} / ${flashcards.length}</span>
        <span class="badge bg-secondary ms-2">Known: ${progress.knownFlashcards.length}</span>
      </div>
    </div>
  `

  // Add event listeners
  document.getElementById("flashcard").addEventListener("click", flipCard)
  document.getElementById("flip-card").addEventListener("click", flipCard)
  document.getElementById("prev-card").addEventListener("click", previousCard)
  document.getElementById("next-card").addEventListener("click", nextCard)
  document.getElementById("mark-known").addEventListener("click", () => markCard(true))
  document.getElementById("mark-unknown").addEventListener("click", () => markCard(false))

  // Update counter in tab
  updateFlashcardCounter()
}

// Flip card
function flipCard() {
  isFlipped = !isFlipped
  renderFlashcard()
}

// Previous card
function previousCard() {
  if (currentFlashcardIndex > 0) {
    currentFlashcardIndex--
    isFlipped = false
    renderFlashcard()
  }
}

// Next card
function nextCard() {
  if (currentFlashcardIndex < currentCapsule.flashcards.length - 1) {
    currentFlashcardIndex++
    isFlipped = false
    renderFlashcard()
  }
}

// Mark card as known/unknown
function markCard(known) {
  const progress = storage.getProgress(currentCapsule.id)

  if (known) {
    if (!progress.knownFlashcards.includes(currentFlashcardIndex)) {
      progress.knownFlashcards.push(currentFlashcardIndex)
    }
  } else {
    progress.knownFlashcards = progress.knownFlashcards.filter((i) => i !== currentFlashcardIndex)
  }

  storage.saveProgress(currentCapsule.id, progress)
  renderFlashcard()
}

// Update flashcard counter
function updateFlashcardCounter() {
  const counter = document.getElementById("flashcard-counter")
  if (counter) {
    const progress = storage.getProgress(currentCapsule.id)
    counter.textContent = `${progress.knownFlashcards.length}/${currentCapsule.flashcards.length}`
  }
}

// Load quiz
function loadQuiz() {
  const viewer = document.getElementById("quiz-viewer")
  currentQuizIndex = 0
  quizAnswers = []
  quizStarted = false

  if (currentCapsule.quiz.length === 0) {
    viewer.innerHTML = '<div class="empty-state"><p>No quiz questions available</p></div>'
    return
  }

  renderQuizStart()
}

// Render quiz start
function renderQuizStart() {
  const viewer = document.getElementById("quiz-viewer")
  const progress = storage.getProgress(currentCapsule.id)

  viewer.innerHTML = `
    <div class="quiz-container">
      <div class="text-center py-5">
        <h3 class="mb-3">Ready to test your knowledge?</h3>
        <p class="text-muted mb-4">This quiz has ${currentCapsule.quiz.length} questions</p>
        ${progress.bestScore > 0 ? `<p class="mb-4">Your best score: <strong class="text-primary">${progress.bestScore}%</strong></p>` : ""}
        <button class="btn btn-primary btn-lg" id="start-quiz-btn">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" class="me-2">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
          </svg>
          Start Quiz
        </button>
      </div>
    </div>
  `

  document.getElementById("start-quiz-btn").addEventListener("click", startQuiz)
}

// Start quiz
function startQuiz() {
  quizStarted = true
  currentQuizIndex = 0
  quizAnswers = new Array(currentCapsule.quiz.length).fill(null)
  renderQuizQuestion()
}

// Render quiz question
function renderQuizQuestion() {
  const viewer = document.getElementById("quiz-viewer")
  const question = currentCapsule.quiz[currentQuizIndex]
  const isAnswered = quizAnswers[currentQuizIndex] !== null

  viewer.innerHTML = `
    <div class="quiz-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <span class="badge bg-secondary">Question ${currentQuizIndex + 1} of ${currentCapsule.quiz.length}</span>
        <div class="progress" style="width: 200px; height: 8px;">
          <div class="progress-bar" style="width: ${((currentQuizIndex + 1) / currentCapsule.quiz.length) * 100}%"></div>
        </div>
      </div>

      <div class="quiz-question-card">
        <h4 class="quiz-question-text text-balance">${escapeHtml(question.question)}</h4>
        <div class="quiz-choices" id="quiz-choices">
          ${question.choices
            .map(
              (choice, index) => `
            <div class="quiz-choice ${isAnswered && index === quizAnswers[currentQuizIndex] ? "selected" : ""} ${isAnswered && index === question.correctIndex ? "correct" : ""} ${isAnswered && index === quizAnswers[currentQuizIndex] && index !== question.correctIndex ? "incorrect" : ""}" data-index="${index}">
              <span class="choice-letter">${String.fromCharCode(65 + index)}</span>
              <span>${escapeHtml(choice)}</span>
            </div>
          `,
            )
            .join("")}
        </div>

        ${
          isAnswered && question.explanation
            ? `
          <div class="quiz-explanation">
            <strong>Explanation:</strong> ${escapeHtml(question.explanation)}
          </div>
        `
            : ""
        }
      </div>

      <div class="d-flex justify-content-between mt-4">
        <button class="btn btn-outline-secondary" id="prev-question" ${currentQuizIndex === 0 ? "disabled" : ""}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Previous
        </button>
        ${
          currentQuizIndex === currentCapsule.quiz.length - 1
            ? `<button class="btn btn-primary" id="finish-quiz" ${!isAnswered ? "disabled" : ""}>Finish Quiz</button>`
            : `<button class="btn btn-primary" id="next-question" ${!isAnswered ? "disabled" : ""}>
            Next
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>`
        }
      </div>
    </div>
  `

  // Add event listeners for choices
  if (!isAnswered) {
    const choices = document.querySelectorAll(".quiz-choice")
    choices.forEach((choice) => {
      choice.addEventListener("click", () => handleQuizAnswer(Number.parseInt(choice.dataset.index)))
    })
  }

  // Navigation buttons
  const prevBtn = document.getElementById("prev-question")
  const nextBtn = document.getElementById("next-question")
  const finishBtn = document.getElementById("finish-quiz")

  if (prevBtn) prevBtn.addEventListener("click", previousQuestion)
  if (nextBtn) nextBtn.addEventListener("click", nextQuestion)
  if (finishBtn) finishBtn.addEventListener("click", finishQuiz)
}

// Handle quiz answer
function handleQuizAnswer(selectedIndex) {
  quizAnswers[currentQuizIndex] = selectedIndex
  renderQuizQuestion()

  // Auto-advance after 1.5 seconds
  setTimeout(() => {
    if (currentQuizIndex < currentCapsule.quiz.length - 1) {
      nextQuestion()
    }
  }, 1500)
}

// Previous question
function previousQuestion() {
  if (currentQuizIndex > 0) {
    currentQuizIndex--
    renderQuizQuestion()
  }
}

// Next question
function nextQuestion() {
  if (currentQuizIndex < currentCapsule.quiz.length - 1) {
    currentQuizIndex++
    renderQuizQuestion()
  }
}

// Finish quiz
function finishQuiz() {
  const correctCount = quizAnswers.filter((answer, index) => answer === currentCapsule.quiz[index].correctIndex).length
  const score = Math.round((correctCount / currentCapsule.quiz.length) * 100)

  // Update best score
  const progress = storage.getProgress(currentCapsule.id)
  if (score > progress.bestScore) {
    progress.bestScore = score
    storage.saveProgress(currentCapsule.id, progress)
  }

  renderQuizResults(score, correctCount)
}

// Render quiz results
function renderQuizResults(score, correctCount) {
  const viewer = document.getElementById("quiz-viewer")

  const getMessage = (score) => {
    if (score === 100) return "Perfect Score!"
    if (score >= 80) return "Excellent Work!"
    if (score >= 60) return "Good Job!"
    if (score >= 40) return "Keep Practicing!"
    return "Try Again!"
  }

  viewer.innerHTML = `
    <div class="quiz-results">
      <div class="quiz-score">${score}%</div>
      <h3 class="quiz-message">${getMessage(score)}</h3>
      <p class="text-muted mb-4">You got ${correctCount} out of ${currentCapsule.quiz.length} questions correct</p>
      <div class="d-flex gap-2 justify-content-center">
        <button class="btn btn-primary" id="retake-quiz">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="me-2">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          Retake Quiz
        </button>
        <button class="btn btn-outline-secondary" id="review-answers">Review Answers</button>
      </div>
    </div>
  `

  document.getElementById("retake-quiz").addEventListener("click", startQuiz)
  document.getElementById("review-answers").addEventListener("click", () => {
    currentQuizIndex = 0
    renderQuizQuestion()
  })
}

// Handle export from learn view
function handleExportFromLearn() {
  if (currentCapsule) {
    storage.exportCapsule(currentCapsule)
  }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
  // Only handle shortcuts in learn view
  if (!document.getElementById("learn-view").classList.contains("active")) return

  // Space: flip flashcard
  if (event.code === "Space" && document.getElementById("flashcard")) {
    event.preventDefault()
    flipCard()
  }

  // [ and ]: cycle tabs
  if (event.code === "BracketLeft" || event.code === "BracketRight") {
    event.preventDefault()
    const tabs = ["notes-tab", "flashcards-tab", "quiz-tab"]
    const activeTab = document.querySelector(".learn-tabs .nav-link.active")
    const currentIndex = tabs.indexOf(activeTab.id)

    let nextIndex
    if (event.code === "BracketLeft") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
    } else {
      nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
    }

    document.getElementById(tabs[nextIndex]).click()
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
