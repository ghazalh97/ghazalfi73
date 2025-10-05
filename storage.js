// Storage helper functions for LocalStorage management

const STORAGE_KEYS = {
  INDEX: "pc_capsules_index",
  CAPSULE_PREFIX: "pc_capsule_",
  PROGRESS_PREFIX: "pc_progress_",
}

const SCHEMA_VERSION = "pocket-classroom/v1"

// Get all capsules index
export function getCapsulesIndex() {
  try {
    const index = localStorage.getItem(STORAGE_KEYS.INDEX)
    return index ? JSON.parse(index) : []
  } catch (error) {
    console.error("[v0] Error reading capsules index:", error)
    return []
  }
}

// Save capsules index
export function saveCapsulesIndex(index) {
  try {
    localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(index))
    return true
  } catch (error) {
    console.error("[v0] Error saving capsules index:", error)
    return false
  }
}

// Get a single capsule by ID
export function getCapsule(id) {
  try {
    const capsule = localStorage.getItem(STORAGE_KEYS.CAPSULE_PREFIX + id)
    return capsule ? JSON.parse(capsule) : null
  } catch (error) {
    console.error("[v0] Error reading capsule:", error)
    return null
  }
}

// Save a capsule
export function saveCapsule(capsule) {
  try {
    // Ensure capsule has required fields
    if (!capsule.id || !capsule.meta || !capsule.meta.title) {
      throw new Error("Invalid capsule data")
    }

    // Save the full capsule
    localStorage.setItem(STORAGE_KEYS.CAPSULE_PREFIX + capsule.id, JSON.stringify(capsule))

    // Update index
    const index = getCapsulesIndex()
    const existingIndex = index.findIndex((item) => item.id === capsule.id)

    const indexEntry = {
      id: capsule.id,
      title: capsule.meta.title,
      subject: capsule.meta.subject || "",
      level: capsule.meta.level || "Beginner",
      updatedAt: capsule.updatedAt,
    }

    if (existingIndex >= 0) {
      index[existingIndex] = indexEntry
    } else {
      index.push(indexEntry)
    }

    saveCapsulesIndex(index)
    return true
  } catch (error) {
    console.error("[v0] Error saving capsule:", error)
    return false
  }
}

// Delete a capsule
export function deleteCapsule(id) {
  try {
    localStorage.removeItem(STORAGE_KEYS.CAPSULE_PREFIX + id)
    localStorage.removeItem(STORAGE_KEYS.PROGRESS_PREFIX + id)

    const index = getCapsulesIndex()
    const newIndex = index.filter((item) => item.id !== id)
    saveCapsulesIndex(newIndex)

    return true
  } catch (error) {
    console.error("[v0] Error deleting capsule:", error)
    return false
  }
}

// Get progress for a capsule
export function getProgress(capsuleId) {
  try {
    const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS_PREFIX + capsuleId)
    return progress ? JSON.parse(progress) : { bestScore: 0, knownFlashcards: [] }
  } catch (error) {
    console.error("[v0] Error reading progress:", error)
    return { bestScore: 0, knownFlashcards: [] }
  }
}

// Save progress for a capsule
export function saveProgress(capsuleId, progress) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS_PREFIX + capsuleId, JSON.stringify(progress))
    return true
  } catch (error) {
    console.error("[v0] Error saving progress:", error)
    return false
  }
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Validate imported capsule
export function validateCapsule(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid data format" }
  }

  if (data.schema !== SCHEMA_VERSION) {
    return { valid: false, error: "Unsupported schema version" }
  }

  if (!data.meta || !data.meta.title || typeof data.meta.title !== "string") {
    return { valid: false, error: "Missing or invalid title" }
  }

  const hasContent =
    (data.notes && data.notes.length > 0) ||
    (data.flashcards && data.flashcards.length > 0) ||
    (data.quiz && data.quiz.length > 0)

  if (!hasContent) {
    return { valid: false, error: "Capsule must have at least one type of content" }
  }

  return { valid: true }
}

// Export capsule as JSON
export function exportCapsule(capsule) {
  const exportData = {
    schema: SCHEMA_VERSION,
    ...capsule,
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${slugify(capsule.meta.title)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper: slugify string
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

// Helper: time ago
export function timeAgo(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}
