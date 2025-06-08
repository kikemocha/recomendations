// src/App.tsx
import React from 'react';
import Home from './pages/Home';
import './index.css';
import { MyContextProvider } from './context/MyContext';

const App: React.FC = () => {
  return (
    <MyContextProvider>
      <Home />
    </MyContextProvider>
  );
};

export default App;
