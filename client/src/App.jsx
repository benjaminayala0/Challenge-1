import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [notas, setNotas] = useState([]);
  
  // Estado para saber si estamos editando (guarda el ID de la nota)
  const [idEditar, setIdEditar] = useState(null);

  const obtenerNotas = async () => {
    const response = await axios.get('http://localhost:3001/api/notes');
    setNotas(response.data);
  };

  useEffect(() => { obtenerNotas(); }, []);

  // FUNCIÓN : Prepara el formulario para editar
  const activarEdicion = (nota) => {
    setTitulo(nota.title);       // Llena el título
    setContenido(nota.content);  // Llena el contenido
    setIdEditar(nota.id);        // Guarda el ID de la nota a editar
  };

  // FUNCIÓN : Maneja el submit del formulario (tanto para crear como para editar)
  const manejarSubmit = async (e) => {
    e.preventDefault();

    try {

      // VALIDACIÓN BÁSICA 

      if (!titulo.trim() || !contenido.trim()) {
        alert('⚠️ ¡Che! El título y el contenido son obligatorios.');
        return;
      }
  
      if (idEditar) {
        await axios.put(`http://localhost:3001/api/notes/${idEditar}`, {
          title: titulo,
          content: contenido
        });
        alert('¡Nota actualizada! 🔄');
        setIdEditar(null); // Volvemos al modo "Crear"
      } else {

        // Crear nueva nota actualizada
        await axios.post('http://localhost:3001/api/notes', {
          title: titulo,
          content: contenido
        });
        alert('¡Nota creada! ✅');
      }

      // Limpieza y refresh
      setTitulo('');
      setContenido('');
      obtenerNotas();

    } catch (error) {
      console.error(error);
      alert('Hubo un error ❌');
    }
  };

  const borrarNota = async (id) => {
    if (!window.confirm('¿Borrar?')) return;
    await axios.delete(`http://localhost:3001/api/notes/${id}`);
    obtenerNotas();
  };

  // Función para marcar/desmarcar tarea
  const toggleCompletado = async (nota) => {
    try {
      // Enviamos el estado opuesto al que tiene actualmente (!nota.isCompleted)
      await axios.put(`http://localhost:3001/api/notes/${nota.id}`, {
        title: nota.title,
        content: nota.content,
        isCompleted: !nota.isCompleted 
      });
      // Recargamos la lista
      obtenerNotas();
    } catch (error) {
      alert('Error al actualizar estado ❌');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📝 Mis Notas </h1>
      
      {/* FORMULARIO */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#726a6aff', borderRadius: '10px', maxWidth: '400px' , width: '100%'}}>
        <h2>{idEditar ? '🔄 Editando Nota' : '✨ Nueva Nota'}</h2>
        
        <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <input 
            type="text" placeholder="Título" value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <textarea 
            placeholder="Contenido" value={contenido}
            onChange={(e) => setContenido(e.target.value)}
          />
          
          <button type="submit"
          style={{ backgroundColor: idEditar ? '#ff9800' : '#4CAF50', color: 'white', padding: '10px', border: 'none', cursor: 'pointer'}}>
            {idEditar ? 'Actualizar Nota' : 'Crear Nota'}
          </button>
          
          {/* Botón para cancelar edición */}
          {idEditar && (
            <button type="button" onClick={() => { setIdEditar(null); setTitulo(''); setContenido(''); }}>
              Cancelar Edición
            </button>
          )}
        </form>
      </div>

      <hr />

      {/* LISTA DE NOTAS */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {notas.map((nota) => (
          <div key={nota.id} style={{ border: '1px solid #f0f0f0ff', padding: '15px', borderRadius: '8px', width: '200px', backgroundColor: '#514444ff' }}>
            
            {/*  Checkbox  */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="checkbox" 
                checked={!!nota.isCompleted} // Aseguro que sea booleano
                onChange={() => toggleCompletado(nota)} 
                style={{ cursor: 'pointer', transform: 'scale(1.3)' }} 
              />
              
              <h3 style={{ 
                margin: 0, 
                // Si está completada, tachamos y bajamos opacidad
                textDecoration: nota.isCompleted ? 'line-through' : 'none',
                opacity: nota.isCompleted ? 0.6 : 1,
                color: 'white' 
              }}>
                {nota.title}
              </h3>
            </div>
            <p style={{ color: '#ddd' }}>{nota.content}</p> 
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => activarEdicion(nota)} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}>
                Editar ✏️
              </button>
              <button onClick={() => borrarNota(nota.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}>
                Borrar 🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;