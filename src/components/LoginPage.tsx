import React, { useState } from 'react';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Credentials hardcodate
    if (username === 'aduadu321' && password === 'Kreator1234!') {
      setError('');
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
