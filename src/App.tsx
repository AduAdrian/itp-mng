import { useState, useEffect } from 'react';
import './App.css';
import VehicleForm from './components/VehicleForm';
import LoginPage from './components/LoginPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifică dacă utilizatorul a ales să rămână conectat
    const rememberLogin = localStorage.getItem('rememberLogin');
    const loginExpiry = localStorage.getItem('loginExpiry');
    
    if (rememberLogin === 'true' && loginExpiry) {
      const expiryTime = parseInt(loginExpiry);
      if (Date.now() < expiryTime) {
        setIsLoggedIn(true);
      } else {
        // Expirat, șterge din localStorage
        localStorage.removeItem('rememberLogin');
        localStorage.removeItem('loginExpiry');
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <VehicleForm />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
