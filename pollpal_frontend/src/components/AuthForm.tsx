import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LogIn } from 'lucide-react';
import './AuthForm.css';

export function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loginError } = useAuth();

    // Called when the login/register form is submitted
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            login(username, password);
        } else {
            register(username, password);
        }
    };

    // Return the login/register form
    return (
        <div className="auth-form">
            <form onSubmit={handleSubmit} >
                <h2>{isLogin ? 'Login to PollPal!' : 'Register for PollPal!'}</h2>
                <div className="padding">
                    <div className="input-box">
                        <label className="username" htmlFor="username">
                            Username
                        </label>
                    </div>
                    <input
                        className=""
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <div className="input-box">
                        <label className="password" htmlFor="password">
                            Password
                        </label>
                    </div>
                    <input
                        className=""
                        id="password"
                        type="password"
                        placeholder="*********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                </div>
                {loginError && <div className="error-popup">{loginError}</div>}
                <div className="button-box">
                    <button className="left-button" type="submit">
                        {isLogin ? <LogIn className="icon-space" /> : <UserPlus className="icon-space" />}
                        {isLogin ? 'Lock In' : 'Sign Up'}
                    </button>
                    <button type="button" className="" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Register instead?' : 'Already have an account?'}
                    </button>
                </div>
            </form>
        </div>
    );
}