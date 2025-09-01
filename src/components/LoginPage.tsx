import React, { useState } from 'react';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Credentials hardcodate
    if (username === 'aduadu321' && password === 'Kreator1234!') {
      setError('');
      // Salvează starea de "remember me" în localStorage
      if (rememberMe) {
        localStorage.setItem('rememberLogin', 'true');
        localStorage.setItem('loginExpiry', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString()); // 30 zile
      } else {
        localStorage.removeItem('rememberLogin');
        localStorage.removeItem('loginExpiry');
      }
      onLogin();
    } else {
      setError('Nume de utilizator sau parolă incorectă.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Autentificare</h1>
        <p className="login-subtitle">Management ITP Vehicule</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Utilizator</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div className="form-check">
              <input
                type="checkbox"
                id="rememberMe"
                className="form-check-input"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className="form-check-label">
                Rămâi conectat (30 zile)
              </label>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-login">
            Intră în cont
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
