import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // --- STATES ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [editingId, setEditingId] = useState(null);

  // --- FETCH DATA ---
  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  // --- HANDLERS ---
  const handleEditClick = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return alert('⚠️ Title and Content are required.');
    }

    try {
      if (editingId) {
        // Update existing note
        await axios.put(`http://localhost:3001/api/notes/${editingId}`, {
          title,
          content
        });
        alert('Note updated! 🔄');
        setEditingId(null);
      } else {
        // Create new note
        await axios.post('http://localhost:3001/api/notes', {
          title,
          content
        });
        alert('Note created! ✅');
      }

      // Reset form & refresh
      setTitle('');
      setContent('');
      fetchNotes();

    } catch (error) {
      console.error(error);
      alert('Error saving note ❌');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCompleted = async (note) => {
    try {
      await axios.put(`http://localhost:3001/api/notes/${note.id}`, {
        title: note.title,
        content: note.content,
        isCompleted: !note.isCompleted 
      });
      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  // --- FILTER LOGIC ---
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'pending') return matchesSearch && !note.isCompleted;
    if (filter === 'completed') return matchesSearch && note.isCompleted;
    
    return matchesSearch;
  });

  // --- RENDER ---
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📝 My Notes App</h1>
      
      {/* FORM SECTION */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#726a6aff', borderRadius: '10px', maxWidth: '400px', width: '100%', margin: '0 0 40px 0' }}>
        <h2>{editingId ? '🔄 Edit Note' : '✨ New Note'}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" placeholder="Title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '8px' }}
          />
          <textarea 
            placeholder="Content" value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ padding: '8px', minHeight: '80px', resize: 'none' }}
          />
          
          <button type="submit" style={{ backgroundColor: editingId ? '#ff9800' : '#4CAF50', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
            {editingId ? 'Update Note' : 'Create Note'}
          </button>
          
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); }} style={{ padding: '5px', cursor: 'pointer' }}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <hr />

      {/* SEARCH & FILTERS */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Search notes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '250px' }}
        />

        <div style={{ display: 'flex', gap: '5px' }}>
          {['all', 'pending', 'completed'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                backgroundColor: filter === f ? '#646cff' : '#444', 
                color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', textTransform: 'capitalize' 
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* NOTES LIST */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', minHeight: '50vh', alignContent: 'flex-start' }}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} style={{ border: '1px solid #f0f0f0ff', padding: '15px', borderRadius: '8px', width: '200px', backgroundColor: '#514444ff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={!!note.isCompleted} 
                    onChange={() => toggleCompleted(note)} 
                    style={{ cursor: 'pointer', transform: 'scale(1.3)' }} 
                  />
                  <h3 style={{ margin: 0, textDecoration: note.isCompleted ? 'line-through' : 'none', opacity: note.isCompleted ? 0.6 : 1, color: 'white' }}>
                    {note.title}
                  </h3>
                </div>
                <p style={{ color: '#ddd' }}>{note.content}</p> 
                
               <small style={{ display: 'block', marginTop: '10px', color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
              📅 {new Date(note.createdAt).toLocaleDateString()} 
              {' '} 
              {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
              </div>
              

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => handleEditClick(note)} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '5px', cursor: 'pointer', flex: 1, borderRadius: '4px' }}>
                  Edit ✏️
                </button>
                <button onClick={() => handleDelete(note.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px', cursor: 'pointer', flex: 1, borderRadius: '4px' }}>
                  Delete 🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#aaa', width: '100%', textAlign: 'center' }}>No notes found 🕵️</p>
        )}
      </div>
    </div>
  );
}

export default App;