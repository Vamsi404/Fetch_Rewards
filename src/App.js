import React, { useState } from 'react';
import LoginPage from './LoginPage';
import DogSearchPage from './DogSearchPage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  // Function to handle logout
  const handleLogout = async () => {
    await fetch("https://frontend-take-home-service.fetch.com/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    setLoggedIn(false);
  };

  return (
    <div>
      {!loggedIn ? (
        <LoginPage onLoginSuccess={() => setLoggedIn(true)} />
      ) : (
        <DogSearchPage onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
