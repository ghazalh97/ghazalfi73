# Pocket Classroom - Offline Learning Capsules

A beautiful, offline-first web application for creating and studying learning capsules with notes, flashcards, and quizzes.

## Features

### 📚 Library
- Grid view of all your learning capsules
- Track progress with quiz scores and known flashcards
- Quick actions: Learn, Edit, Export, Delete
- Import/Export capsules as JSON for peer-to-peer sharing

### ✍️ Author Mode
- Create and edit learning capsules
- Add notes (one point per line)
- Create flashcards with front/back content
- Build quizzes with multiple choice questions
- Auto-save functionality
- Validation to ensure quality content

### 🎓 Learn Mode
- **Notes Tab**: Browse and search through your notes
- **Flashcards Tab**: Interactive flip cards with known/unknown tracking
- **Quiz Tab**: Test your knowledge with instant feedback
- Progress tracking and best score recording
- Keyboard shortcuts for efficient studying

## Keyboard Shortcuts

- **Space**: Flip flashcard (when viewing flashcards)
- **[ / ]**: Cycle between Notes ↔ Flashcards ↔ Quiz tabs

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, flexbox, grid
- **Bootstrap 5**: Component framework (CDN)
- **Vanilla JavaScript**: ES6 modules
- **LocalStorage**: Offline data persistence

## File Structure

\`\`\`
pocket-classroom/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # Custom styles
├── js/
│   ├── app.js             # Main application logic
│   ├── storage.js         # LocalStorage helpers
│   ├── library.js         # Library view
│   ├── author.js          # Author mode
│   └── learn.js           # Learn mode
└── README.md              # This file
\`\`\`

## Data Schema

Capsules are stored in LocalStorage with the following structure:

\`\`\`json
{
  "schema": "pocket-classroom/v1",
  "id": "unique-id",
  "meta": {
    "title": "Capsule Title",
    "subject": "Subject Name",
    "level": "Beginner|Intermediate|Advanced",
    "description": "Optional description"
  },
  "notes": ["Note 1", "Note 2"],
  "flashcards": [
    { "front": "Question", "back": "Answer" }
  ],
  "quiz": [
    {
      "question": "Question text",
      "choices": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Optional explanation"
    }
  ],
  "updatedAt": "2025-01-03T12:00:00.000Z"
}
\`\`\`

## Getting Started

1. Open `index.html` in a modern web browser
2. Create your first capsule using the "New Capsule" button
3. Add notes, flashcards, and quiz questions
4. Save and start learning!

## Features Highlights

- ✅ Fully offline - works without internet
- ✅ Responsive design - works on mobile and desktop
- ✅ Dark theme with beautiful gradients
- ✅ Accessible - keyboard navigation and ARIA labels
- ✅ Export/Import - share capsules with peers
- ✅ Progress tracking - monitor your learning journey

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is open source and available for educational purposes.

---

Built with ❤️ for learners everywhere
