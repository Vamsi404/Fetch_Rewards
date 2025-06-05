import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

function LoginPage({ onLoginSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("https://frontend-take-home-service.fetch.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        onLoginSuccess();
      } else {
        setError("Login failed. Please check your info.");
      }
    } catch (err) {
      setError("Network error.");
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
      <Paper elevation={6} sx={{ p: 4, width: 340 }}>
        <Typography variant="h5" mb={2}>Login to Fetch</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            fullWidth
            margin="normal"
            autoFocus
          />
          <TextField
            label="Email"
            value={email}
            type="email"
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        </form>
      </Paper>
    </Box>
  );
}

export default LoginPage;
