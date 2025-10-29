const express = require('express')
const authRoutes = require('./routes/auth');

const app = express()
const port = 3000

// Add middleware to parse JSON and URL-encoded bodies
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Use auth routes (if they exist)
// app.use('/auth', authRoutes);



// Your POST endpoint
app.post('/registration', (req, res) => {
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // console.log('testing ',  emailRegex.test(email))
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return false;
    } else {
      return true;
    }
  }
  let response
  console.log('Request body:', req.body); // This will now work

  // Additional email format check
  if (!validateEmail(req.body.email)) {
    return res.status(400).json({
      status: 102,
      message: 'Parameter email tidak sesuai format',
      data: null
    });
  } else if (!validatePassword(req.body.password)) {
    return res.status(400).json({
      status: 102,
      message: 'Password minimal 8 karakter',
      data: null
    });
  } else {
    response = {
      status: 0,
      message: "Registrasi berhasil silahkan login",
      date: null
    };

    res.status(200).json(response);
  }


})

app.post('/login', (req, res) => {
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.get('/profile', (req, res) => {
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.put('/profile/update', (req, res) => {
  console.log('profile update')
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.put('/profile/image', (req, res) => {
  console.log('profile update')
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.get('/banner', (req, res) => {
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.get('/services', (req, res) => {
  console.log('Request body:', req.body);
  res.send('Hello World! 2')
})

app.get('/balance', (req, res) => {
  console.log('Request body:', req.body);
  res.send('Hello World! 2')
})

app.post('/topup', (req, res) => {
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.post('/transaction', (req, res) => {
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.post('/transaction/history', (req, res) => {
  console.log('Request body:', req.body); 
  res.send('Hello World! 2')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})