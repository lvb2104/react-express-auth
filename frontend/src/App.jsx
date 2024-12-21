import { useEffect, useState } from 'react';
import './App.css';

const baseApi = 'http://localhost:3000/api';

function App() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [fields, setFields] = useState({
        email: '',
        password: '',
    });

    const setFieldValue = ({ target: { name, value } }) => {
        setFields((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        // send data to backend
        fetch(`${baseApi}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // credentials: 'include' is used to set cookies in the browser, so that the browser can send the cookies to the server when making requests.
            credentials: 'include',
            body: JSON.stringify(fields),
        })
            .then((res) => {
                if (res.ok) return res.json();
                throw Error(res.statusText);
            })
            .then((data) => {
                localStorage.setItem('token', data.token);
            })
            .catch((err) => {
                if (err.message === 'Unauthorized') {
                    setError('Invalid email or password');
                } else {
                    setError('Something went wrong');
                }
            });
    };

    useEffect(() => {
        fetch(`${baseApi}/auth/me`, {
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((res) => res.json())
            .then((me) => setUser(me));
    }, []);

    return (
        <div>
            {user ? (
                <h1>Welcome {user.name}</h1>
            ) : (
                <>
                    {/* send data to backend */}
                    <h1>Login</h1>
                    <form onSubmit={handleLogin}>
                        <div>
                            <label>Email</label>
                            <input
                                type='email'
                                name='email'
                                value={fields.email}
                                onChange={setFieldValue}
                            />
                        </div>
                        <div>
                            <label>Password</label>
                            <input
                                type='password'
                                name='password'
                                value={fields.password}
                                onChange={setFieldValue}
                            />
                        </div>
                        <button type='submit'>Login</button>
                    </form>
                </>
            )} 
        </div>
    );
}

export default App;
