require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Ana sayfa
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory database (gerçek veritabanı yerine)
let urlDatabase = {};
let counter = 1;

// POST endpoint: URL kısaltma
app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;
  
  try {
    // URL formatını kontrol et
    let urlObj = new URL(originalUrl);
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Yeni kısa URL oluştur
        let shortUrl = counter++;
        urlDatabase[shortUrl] = originalUrl;
        res.json({
          original_url: originalUrl,
          short_url: shortUrl
        });
      }
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint: kısa URL’den yönlendirme
app.get('/api/shorturl/:short_url', (req, res) => {
  let shortUrl = req.params.short_url;
  let originalUrl = urlDatabase[shortUrl];
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Portu dinle
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
