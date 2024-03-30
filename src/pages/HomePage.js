import React, { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token !== null) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
      
    }, []);

    return (
        <div>
            {isLoggedIn ? <DashboardPage /> : <LoginPage />}
        </div>
    );
}

export default HomePage;
