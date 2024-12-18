const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Kullanıcı bilgilerini tutan JSON dosyası
const userDataPath = './data/users.json';
const secretKey = 'secret'; // JWT için gizli anahtar

// Giriş sayfası
router.get('/login', (req, res) => {
    res.render('login');
});

// Kayıt sayfası
router.get('/register', (req, res) => {
    res.render('register');
});

// Dashboard sayfası
router.get('/dashboard', (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        res.render('dashboard', { username: decoded.username });
    } catch (err) {
        res.redirect('/login');
    }
});

// Kayıt işlemi
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send('Lütfen tüm alanları doldurun.');
    }

    const users = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));

    // Kullanıcı kontrolü
    if (users.find(user => user.username === username)) {
        return res.send('Bu kullanıcı adı zaten kullanılıyor.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2));

    res.redirect('/login');
});

// Giriş işlemi
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const users = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
    const user = users.find(user => user.username === username);

    if (!user) {
        return res.send('Kullanıcı bulunamadı.');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return res.send('Yanlış şifre.');
    }

    const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
    res.header('Authorization', token).redirect('/dashboard');
});

module.exports = router;
