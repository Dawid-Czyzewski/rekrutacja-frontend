import React, { useState } from 'react';
import '../styles/LoginPage.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/login_check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                window.location.reload();
            } else {
                console.error('Wystąpił błąd podczas zapisu tokenu:');
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas wysyłania żądania:', error);
        }
    };

    return (
        <div className="container">
            <form className="form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <input 
                        type="text" 
                        placeholder="email" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                <button className="button" type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
