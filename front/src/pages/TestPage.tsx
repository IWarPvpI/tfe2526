import React, { useState } from 'react';

const TestPage: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      marginTop: '2rem' 
    }}>
      <h1>Page de Test</h1>
      <p>Bienvenue sur la page de test technique. Si vous voyez ce message et que le bouton fonctionne, le React et le TypeScript sont correctement configurés !</p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        display: 'inline-block',
        backgroundColor: '#f9f9f9'
      }}>
        <p style={{ fontSize: '1.2rem' }}>Compteur actuel : <strong>{count}</strong></p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            padding: '10px 20px', 
            fontSize: '1rem', 
            cursor: 'pointer', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Incrémenter
        </button>
      </div>
    </div>
  );
};

export default TestPage;
