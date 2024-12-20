import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// fake DB
const db = {
    users: [
        {
            id: 1,
            name: 'John Doe',
            password: '123456',
            email: 'abcdef@gmail.com',
        },
        {
            id: 2,
            name: 'Donal Trump',
            password: '123456',
            email: 'abcde@gmail.com',
        },
    ],
    posts: [
        {
            id: 1,
            title: 'Post 1',
            content: 'Content 1',
            userId: 1,
        },
        {
            id: 2,
            title: 'Post 2',
            content: 'Content 2',
            userId: 2,
        },
    ],
};

// Session -> stateful -> store data in memory (not recommended for production) -> store data in database or cache (Redis) -> JWT (stateless) -> store data in token (not recommended for sensitive data)
const session = {};

// If you want to call api from another domain, you need to enable CORS, or you need to create a middle server (apart from browser) to call the api and return the data to the client side.
// Frontend -> Middle Server -> Backend

// [GET] /api/posts
app.get('/api/posts', (req, res) => {
    res.json(db.posts);
});

// [POST] /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(
        (user) => user.email === email && user.password === password
    );
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const sessionId = Date.now().toString();
    session[sessionId] = { sub: user.id };

    res.setHeader(
        'Set-Cookie',
        'sessionId=' + sessionId + '; HttpOnly; max-age=3600'
    ).json({ message: 'Login successfully' });
});

// [GET] /api/auth/me
app.get('/api/auth/me', (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { sub } = session[sessionId];
    const user = db.users.find((user) => user.id === sub);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json(user);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
