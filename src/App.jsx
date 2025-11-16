import { useState, useEffect } from "react";
import notesFile from "./notes.json";

function App() {
  // Active category
  const [activeCategory, setActiveCategory] = useState("All Notes");

  // Modal + Inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [editingNote, setEditingNote] = useState(null);

  // Theme
  const [theme, setTheme] = useState("pastel");

  // Right-side reading panel
  const [selectedNote, setSelectedNote] = useState(null);

  // 3 dots menu
  const [menuOpen, setMenuOpen] = useState(null);

  // Search State
  const [searchText, setSearchText] = useState("");

  // Notes list (load from localStorage OR JSON file)
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notesData");
    if (saved) {
      return JSON.parse(saved);
    }
    // Fallback to static JSON
    return notesFile;
  });

  // Save to localStorage when notes change
  useEffect(() => {
    localStorage.setItem("notesData", JSON.stringify(notes));
  }, [notes]);

  // Pretty date formatter (Q2: Option B)
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter by category + search
  const filteredNotes = notes.filter((note) => {
    const matchesCategory =
      activeCategory === "All Notes" || note.category === activeCategory;

    const matchesSearch =
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.description.toLowerCase().includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Category Button Styling
  const categoryButtonStyle = (category) => ({
    display: "block",
    width: "100%",
    padding: "8px 10px",
    marginBottom: "12px",
    borderRadius: "999px",
    cursor: "pointer",
    border:
      activeCategory === category
        ? "2px solid #7c3aed"
        : theme === "pastel"
        ? "1px solid #d3b4ff"
        : "1px solid #444",
    background:
      activeCategory === category
        ? theme === "pastel"
          ? "#e0d4ff"
          : "#33334d"
        : theme === "pastel"
        ? "#f9f5ff"
        : "#2a2a2a",
    color: theme === "pastel" ? "#2d1b69" : "#f5f5f5",
    fontWeight: activeCategory === category ? "600" : "500",
    textAlign: "left",
  });

  // Handle Save (Add + Edit) with duplicate check
  const handleSaveNote = () => {
    const trimmedTitle = newTitle.trim();
    const trimmedDesc = newDescription.trim();

    if (!trimmedTitle || !trimmedDesc) {
      alert("Title and Description cannot be empty.");
      return;
    }

    // Duplicate title check (same category, different ID)
    const normalizedTitle = trimmedTitle.toLowerCase();
    const duplicateExists = notes.some(
      (n) =>
        n.id !== (editingNote ? editingNote.id : null) &&
        n.category === newCategory &&
        n.title.trim().toLowerCase() === normalizedTitle
    );

    if (duplicateExists) {
      alert("A note with this title already exists in this category.");
      return;
    }

    if (editingNote) {
      // EDIT MODE
      const updatedNotes = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: trimmedTitle,
              description: trimmedDesc,
              category: newCategory,
            }
          : n
      );
      setNotes(updatedNotes);

      // If selected note is the same as edited, update it too
      if (selectedNote && selectedNote.id === editingNote.id) {
        setSelectedNote({
          ...selectedNote,
          title: trimmedTitle,
          description: trimmedDesc,
          category: newCategory,
        });
      }

      setEditingNote(null);
    } else {
      // ADD MODE
      const newNote = {
        id: Date.now(),
        title: trimmedTitle,
        description: trimmedDesc,
        category: newCategory,
        createdAt: new Date().toISOString(),
      };
      setNotes([...notes, newNote]);
    }

    // Reset + close modal
    setNewTitle("");
    setNewDescription("");
    setNewCategory("Work");
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: theme === "pastel" ? "#F3E8FF" : "#121212",
        color: theme === "pastel" ? "#333" : "#e0e0e0",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          background: theme === "pastel" ? "#ECE0FF" : "#1a1a1a",
          padding: "20px",
          borderRight:
            theme === "pastel" ? "1px solid #d3b4ff" : "1px solid #333",
        }}
      >
        {/* THEME BUTTON */}
        <button
          style={{
            marginBottom: "20px",
            padding: "10px",
            width: "100%",
            background: theme === "pastel" ? "#111827" : "#ffe4f3",
            color: theme === "pastel" ? "white" : "#111827",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => setTheme(theme === "pastel" ? "dark" : "pastel")}
        >
          {theme === "pastel"
            ? "🌙 Switch to Dark Mode"
            : "🌸 Switch to Pastel Mode"}
        </button>

        <h2 style={{ marginBottom: "12px" }}>Categories</h2>

        <button
          style={categoryButtonStyle("All Notes")}
          onClick={() => setActiveCategory("All Notes")}
        >
          All Notes
        </button>

        <button
          style={categoryButtonStyle("Work")}
          onClick={() => setActiveCategory("Work")}
        >
          Work
        </button>

        <button
          style={categoryButtonStyle("Personal")}
          onClick={() => setActiveCategory("Personal")}
        >
          Personal
        </button>

        <button
          style={categoryButtonStyle("Ideas")}
          onClick={() => setActiveCategory("Ideas")}
        >
          Ideas
        </button>

        {/* ADD NOTE BUTTON */}
        <button
          style={{
            marginTop: "30px",
            padding: "12px",
            width: "100%",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
            background: theme === "pastel" ? "#C7B3FF" : "#4C24A8",
            color: theme === "pastel" ? "#2d1b69" : "#f5f5f5",
            border:
              theme === "pastel" ? "1px solid #a98ff0" : "1px solid #5f3ccf",
            boxShadow:
              theme === "pastel"
                ? "0 4px 10px rgba(124,58,237,0.25)"
                : "0 4px 12px rgba(0,0,0,0.4)",
          }}
          onClick={() => {
            setEditingNote(null);
            setNewTitle("");
            setNewDescription("");
            setNewCategory("Work");
            setIsModalOpen(true);
          }}
        >
          + Add Note
        </button>
      </aside>

      {/* NOTES GRID + SEARCH BAR */}
      <main style={{ flex: 1, padding: "24px" }}>
        <h1>{activeCategory} Notes</h1>

        {/* SEARCH BAR */}
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            margin: "10px 0 20px 0",
            borderRadius: "8px",
            border:
              theme === "pastel" ? "1px solid #c9b6ff" : "1px solid #444",
            background: theme === "pastel" ? "#ffffff" : "#1e1e1e",
            color: theme === "pastel" ? "#2d1b69" : "#eee",
            fontSize: "15px",
            outline: "none",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setMenuOpen(null);
              }}
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: theme === "pastel" ? "#ffffff" : "#1e1e1e",
                border:
                  theme === "pastel" ? "1px solid #d3b4ff" : "1px solid #333",
                boxShadow:
                  theme === "pastel"
                    ? "0 4px 10px rgba(124,58,237,0.18)"
                    : "0 4px 10px rgba(0,0,0,0.45)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* DOTS MENU ICON */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === note.id ? null : note.id);
                }}
              >
                ⋮
              </div>

              {/* POPUP MENU */}
              {menuOpen === note.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "32px",
                    right: "10px",
                    background: theme === "pastel" ? "white" : "#2a2a2a",
                    padding: "8px",
                    borderRadius: "8px",
                    border:
                      theme === "pastel"
                        ? "1px solid #e5defd"
                        : "1px solid #555",
                    zIndex: 30,
                  }}
                >
                  <div
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                    onClick={() => {
                      setEditingNote(note);
                      setNewTitle(note.title);
                      setNewDescription(note.description);
                      setNewCategory(note.category);
                      setIsModalOpen(true);
                      setMenuOpen(null);
                    }}
                  >
                    ✏️ Edit
                  </div>

                  <div
                    style={{
                      padding: "6px 12px",
                      cursor: "pointer",
                      color: "red",
                    }}
                    onClick={() => {
                      setNotes(notes.filter((n) => n.id !== note.id));
                      if (selectedNote?.id === note.id) setSelectedNote(null);
                      setMenuOpen(null);
                    }}
                  >
                    🗑 Delete
                  </div>
                </div>
              )}

              <h3>{note.title}</h3>
              <p>{note.description}</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>
                Category: {note.category}
              </p>
              {note.createdAt && (
                <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: 4 }}>
                  {formatDate(note.createdAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* RIGHT PANEL */}
      {selectedNote && (
        <aside
          style={{
            width: "360px",
            background: theme === "pastel" ? "#F7F0FF" : "#1b1b1b",
            padding: "22px",
            borderLeft:
              theme === "pastel" ? "1px solid #d3b4ff" : "1px solid #333",
          }}
        >
          <h2>{selectedNote.title}</h2>
          <p style={{ marginTop: "10px" }}>{selectedNote.description}</p>

          <p style={{ marginTop: "20px" }}>
            Category: {selectedNote.category}
          </p>

          {selectedNote.createdAt && (
            <p
              style={{
                marginTop: "6px",
                fontSize: "12px",
                color: theme === "pastel" ? "#6b7280" : "#9ca3af",
              }}
            >
              Created: {formatDate(selectedNote.createdAt)}
            </p>
          )}

          <div style={{ marginTop: "28px", display: "flex", gap: "10px" }}>
            {/* EDIT BUTTON */}
            <button
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: theme === "pastel" ? "#C7B3FF" : "#4C24A8",
                border: "none",
                fontWeight: 600,
                color: theme === "pastel" ? "#2d1b69" : "#fff",
              }}
              onClick={() => {
                setEditingNote(selectedNote);
                setNewTitle(selectedNote.title);
                setNewDescription(selectedNote.description);
                setNewCategory(selectedNote.category);
                setIsModalOpen(true);
              }}
            >
              ✏️ Edit
            </button>

            {/* DELETE BUTTON */}
            <button
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: theme === "pastel" ? "#FFB3C6" : "#B81C2B",
                border: "none",
                fontWeight: 600,
                color: theme === "pastel" ? "#7a0030" : "#fff",
              }}
              onClick={() => {
                setNotes(notes.filter((n) => n.id !== selectedNote.id));
                setSelectedNote(null);
              }}
            >
              🗑 Delete
            </button>
          </div>

          <button
            style={{
              marginTop: "18px",
              padding: "8px 14px",
              borderRadius: "8px",
              background: theme === "pastel" ? "#E8DCFF" : "#333",
              border: "none",
              fontWeight: 600,
              color: theme === "pastel" ? "#2d1b69" : "#eee",
            }}
            onClick={() => setSelectedNote(null)}
          >
            Close
          </button>
        </aside>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: "360px",
              background: theme === "pastel" ? "#ffffff" : "#1f1f1f",
              padding: "20px",
              borderRadius: "12px",
              border:
                theme === "pastel" ? "1px solid #d3b4ff" : "1px solid #444",
            }}
          >
            <h2>{editingNote ? "Edit Note" : "Add Note"}</h2>

            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            />

            <textarea
              placeholder="Description"
              rows="3"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            ></textarea>

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            >
              <option>Work</option>
              <option>Personal</option>
              <option>Ideas</option>
            </select>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingNote(null);
                }}
              >
                Cancel
              </button>

              <button
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                }}
                onClick={handleSaveNote}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
