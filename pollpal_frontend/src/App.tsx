import { useEffect, useState } from 'react'
import pollPalLogo from '/pollpalfullpink.png'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';

import { Poll } from './types';
import { LogOut, CirclePlus, CircleOff, CheckCircle, UserPen } from 'lucide-react';
import { PollList } from './components/PollList';
import { serverUrl } from './config';


function CreatePollModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (question: string) => void }) {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim()) {
            onSubmit(question);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create New Poll</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            id="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your poll question"
                            required
                        />
                    </div>
                    <div className="modal-button-group">

                        <button type="button" onClick={onClose}><CircleOff />Cancel</button>
                        <button type="submit"><CirclePlus />Create poll</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function NewUsernameModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (newUsername: string) => Promise<{ success: boolean, message?: string }> }) {
    const [newUsername, setNewUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newUsername.trim()) {
            const result = await onSubmit(newUsername);
            if (result.success) {
                onClose();
            } else {
                setError(result.message || "An error occurred");
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Change Your Username</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            id="newUsername"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter your new username"
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-button-group">
                        <button type="button" onClick={onClose}><CircleOff />Cancel</button>
                        <button type="submit"><CheckCircle />Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <PollApp />
        </AuthProvider>
    );
}

function PollApp() {
    const { isAuthenticated, user, logout , setAuth} = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

    const getUsernameById = async (id: number) => {
        try {
            const response = await fetch(`${serverUrl}/getusername`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                return String(data.username);
            }
        }
        catch (error) {
            console.error('Error getting username:', error);
        }
    }
    // Get polls from the server
    const fetchPolls = async () => {
        try {
            const response = await fetch(`${serverUrl}/getpolls`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                //map the data to the poll type
                const mappedPolls: Poll[] = await Promise.all(data.map(async (poll: any) => ({
                    id: poll.id,
                    question: poll.question,
                    createdBy: await getUsernameById(Number(poll.created_by)),
                    createdAt: new Date(poll.created_at),
                    votes: { yes: 0, no: 0 }
                })));
                // Reverse the order of the polls
                mappedPolls.reverse();
                setPolls(mappedPolls);
            }
        } catch (error) {
            console.error('Error getting polls:', error);

        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchPolls();
        }
    }, [isAuthenticated]);

    const createPoll = () => {
        setIsCreatePollModalOpen(true);
    }

    const changeUsername = () => {
        setIsUsernameModalOpen(true);
    }

    // Create a new poll
    const handleCreatePoll = async (question: string) => {
        try {
            const response = await fetch(`${serverUrl}/createpoll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    user_id: user?.id,
                }),
            });
            if (response.ok) {
                const data = await response.json();

                const newPoll: Poll = {
                    id: data.poll_id,
                    question,
                    createdBy: user?.username || 'anonymous',
                    createdAt: new Date(),
                    votes: { yes: 0, no: 0 }
                };

                setPolls([newPoll, ...polls]);

            } else {
                console.error('Failed to create poll');
            }
        } catch (error) {
            console.error('Error creating poll:', error);
        }
    };

    const handleChangeUsername = async (newUsername: string) => {
        try {
            const response = await fetch(`${serverUrl}/changeusername`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user?.id,
                    username: newUsername,
                }),
            });
    
            if (response.ok) {
                setAuth((prevAuth) => ({
                    ...prevAuth,
                    user: prevAuth.user ? { ...prevAuth.user, username: newUsername } : null,
                }));
                fetchPolls();
                return { success: true };
            } else if (response.status === 400) {
                const errorMessage = await response.text();
                console.error('Username already taken');
                return { success: false, message: errorMessage || "Username already taken" };
            } else {
                console.error('Failed to change username');
                return { success: false, message: "Failed to change username" };
            }
        } catch (error) {
            console.error('Error changing username:', error);
            return { success: false, message: "An error occurred" };
        }
    };
    

    // Needs to login or register if not authenticated
    if (!isAuthenticated) {
        return (
            <div>
                <div>
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
                        <img src={pollPalLogo} className="logo" alt="PollPal Logo" />
                    </a>
                </div>
                <AuthForm />
            </div>
        );
    }


    // Returned when authenticated
    return (
        <>
            <div>
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
                    <img src={pollPalLogo} className="logo" alt="PollPal Logo" />
                </a>
            </div>
            <div>
                <span>Welcome, {user?.username}!</span>
            </div>
            <main>

                <PollList polls={polls} />
            </main>
            <button onClick={logout} className="logout-button">
                <LogOut />
                Logout
            </button>
            <button onClick={createPoll} className="create-poll-button">
                <CirclePlus />
                Create poll
            </button>
            <button onClick={changeUsername} className="change-username-button">
                <UserPen />
                Change username
            </button>
            {isCreatePollModalOpen && <CreatePollModal onClose={() => setIsCreatePollModalOpen(false)} onSubmit={handleCreatePoll} />}
            {isUsernameModalOpen && <NewUsernameModal onClose={() => setIsUsernameModalOpen(false)} onSubmit={handleChangeUsername} />}
        </>
    )
}

export default App
