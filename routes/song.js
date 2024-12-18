const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

const songsDataPath = './data/songs.json';

// Multer ayarları (dosya yükleme)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Şarkı yükleme sayfası
router.get('/upload', (req, res) => {
    res.render('upload');
});

// Şarkı yükleme işlemi
router.post('/upload', upload.single('songFile'), (req, res) => {
    const { title, artist } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    // Şarkı bilgilerini JSON'a kaydetme
    const songs = JSON.parse(fs.readFileSync(songsDataPath, 'utf8'));
    songs.push({
        title,
        artist,
        filePath,
        status: 'review' // Başlangıçta inceleme durumunda
    });

    fs.writeFileSync(songsDataPath, JSON.stringify(songs, null, 2));
    res.send('Şarkınız yüklenmiştir, admin tarafından onaylanacaktır.');
});

// Admin paneli (şarkı listesi)
router.get('/admin', (req, res) => {
    const songs = JSON.parse(fs.readFileSync(songsDataPath, 'utf8'));
    res.render('admin', { songs });
});

// Şarkı onaylama/reddetme
router.post('/admin/review', (req, res) => {
    const { index, status } = req.body;

    const songs = JSON.parse(fs.readFileSync(songsDataPath, 'utf8'));
    songs[index].status = status; // Onaylandı veya Reddedildi
    fs.writeFileSync(songsDataPath, JSON.stringify(songs, null, 2));

    res.redirect('/admin');
});

module.exports = router;
