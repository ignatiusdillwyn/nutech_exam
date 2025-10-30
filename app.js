const express = require('express')
const mysql = require('mysql2');
const verifyToken = require('./middleware/auth');

const app = express()
const port = 3000

// Add middleware to parse JSON and URL-encoded bodies
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Use auth routes (if they exist)
// app.use('/auth', authRoutes);

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'exam',
  password: 'Ultraman2!'
});

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

const generateInvoice = () => {
  return 'INV' + Math.floor(100000000 + Math.random() * 900000000).toString();
}

//Registration
app.post('/registration', async (req, res) => {

  let response
  console.log('Request body:', req.body);

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
    await connection.execute(
      `INSERT INTO users (email, first_name, last_name, password, profile_image) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.body.email,
        req.body.first_name,
        req.body.last_name,
        req.body.password,
        '' // atau req.body.profile_image jika ada
      ]
    );

    response = {
      status: 0,
      message: "Registrasi berhasil silahkan login",
      date: null
    };

    res.status(200).json(response);
  }
})

//Login
app.post('/login', async (req, res) => {
  const jwt = require('jsonwebtoken');
  const secretKey = 'nutech9123';
  console.log('Request body:', req.body);
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
    connection.execute(
      `SELECT * FROM users WHERE email = ? AND password = ?`,
      [req.body.email, req.body.password],
      (error, rows, fields) => {
        console.log('rows', rows)
        console.log('fields', fields)
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            status: 999,
            message: "System error"
          });
        }

        if (rows.length === 0) {
          return res.status(401).json({
            status: 103,
            message: "Username atau password salah",
            data: null
          });
        }

        const user = rows[0];

        // Buat JWT token
        const token = jwt.sign(
          {
            user_id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_image: user.profile_image
          },
          secretKey,
          { expiresIn: '12h' } // Token berlaku 12 jam
        );

        // Login berhasil
        res.status(200).json({
          status: 0,
          message: "Login Sukses",
          data: {
            token: token,
          }
        });
      }
    );
  }

})

app.get('/profile', verifyToken, (req, res) => {
  const userData = req.user;
  console.log('userData:', userData);
  return res.status(200).json({
    status: 0,
    message: "Sukses",
    data: {
      user_id: userData.user_id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      // profile_image: ''   
    }
  });
})

app.put('/profile/update', verifyToken, async (req, res) => {
  const userData = req.user;
  console.log('userData:', userData);
  await connection.execute(
    `UPDATE users 
     SET first_name = ?, last_name = ?
     WHERE id = ?`,
    [
      req.body.first_name,
      req.body.last_name,
      req.user.user_id // dari token
    ]
  );

  return res.status(200).json({
    status: 0,
    message: "Update Pofile berhasil",
    data: {
      user_id: userData.user_id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      // profile_image: ''   
    }
  });
})

app.put('/profile/image', (req, res) => {
  console.log('profile image')
  console.log('Request file:', req.file);
  res.send('Hello World! 2')
})

app.get('/banner', (req, res) => {
  console.log('banner')
  connection.execute(
    `SELECT * FROM banner`,
    (error, rows, fields) => {
      console.log('rows', rows)
      console.log('fields', fields)
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          status: 999,
          message: "System error"
        });
      }

      console.log('data ', rows)
      const result = rows

      res.status(200).json({
        status: 0,
        message: "Sukses",
        data: result
      });
    }
  );
})

app.get('/services', verifyToken, (req, res) => {
  console.log('services')
  connection.execute(
    `SELECT * FROM services`,
    (error, rows, fields) => {
      console.log('rows', rows)
      console.log('fields', fields)
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          status: 999,
          message: "System error"
        });
      }

      console.log('data ', rows)
      const result = rows

      res.status(200).json({
        status: 0,
        message: "Sukses",
        data: result
      });
    }
  );
})

app.get('/balance', verifyToken, (req, res) => {
  console.log('Balance');
  console.log('user ', req.user)
  const userData = req.user
  res.send('Hello World! 2')
})

app.post('/topup', verifyToken, async (req, res) => {
  const userData = req.user;
  console.log('Top up');
  console.log('Request body:', req.body);
  console.log('userData:', userData);

  let userBalance = 0

  const amount = req.body.top_up_amount;

  if (!/^\d+$/.test(amount) || Number(amount) < 0) {
    return res.status(400).json({
      status: 102,
      message: "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
      data: null
    });
  } else {
    // Get existing user balance from db
    connection.execute(
      `SELECT balance FROM users where id = ?`,
      [req.user.user_id],
      async (error, rows, fields) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            status: 999,
            message: "System error"
          });
        }

        userBalance = rows[0].balance

        //Total balance after top up
        let totalBalance = userBalance + req.body.top_up_amount;

        console.log('totalBalance ', totalBalance)

        //Update balance to db
        await connection.execute(
          `UPDATE users 
            SET balance = ?
            WHERE id = ?`,
          [
            totalBalance,
            req.user.user_id // dari token
          ]
        );

        //Insert transaction record
        await connection.execute(
          `INSERT INTO transaction (user_id, nominal, type, description, inv) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            req.user.user_id,
            req.body.top_up_amount,
            'TOPUP',
            'Top Up Balance',
            generateInvoice()
          ]
        );

        return res.status(200).json({
          status: 0,
          message: "Top Up Balance berhasil",
          data: {
            balance: totalBalance
          }
        });
      }
    );
  }
})

app.post('/transaction', verifyToken, (req, res) => {
  console.log('Transaction');
  console.log('Request body:', req.body);
  const userData = req.user;
  console.log('userData:', userData);

  connection.execute(
    `SELECT * FROM services where code = ?`,
    [req.body.service_code],
    async (error, rows, fields) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          status: 999,
          message: "System error"
        });
      }

      let dataService = rows[0]

      console.log('dataService ', dataService)

      if (dataService.length === 0) {
        return res.status(400).json({
          status: 102,
          message: "Service ataus Layanan tidak ditemukan",
          data: null
        });
      } else {
        //Cek Saldo
        connection.execute(
          `SELECT balance FROM users WHERE id = ?`,
          [req.user.user_id],
          (error, rows, fields) => {
            if (error) {
              console.error('Database error:', error);
              return res.status(500).json({
                status: 999,
                message: "System error"
              });
            }

            let userBalance = rows[0].balance

            if (userBalance < dataService.tarif) {
              // console.log('Saldo tidak cukup')
              return res.status(502).json({
                status: 102,
                message: "Saldo tidak cukup. Pastikan saldo anda cukup untuk melakukan transaksi",
              });
            } else {
              //Saldo cukup
              connection.execute(
                `SELECT balance FROM users where id = ?`,
                [req.user.user_id],
                async (error, rows, fields) => {
                  if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({
                      status: 999,
                      message: "System error"
                    });
                  }

                  userBalance = rows[0].balance

                  //Total balance after top up
                  let totalBalance = userBalance - dataService.tarif;

                  console.log('totalBalance ', totalBalance)

                  //Update balance to db
                  await connection.execute(
                    `UPDATE users 
                      SET balance = ?
                      WHERE id = ?`,
                    [
                      totalBalance,
                      req.user.user_id // dari token
                    ]
                  );

                  //Insert transaction record
                  await connection.execute(
                    `INSERT INTO transaction (user_id, nominal, type, description, inv) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                      req.user.user_id,
                      dataService.tarif,
                      'PAYMENT',
                      dataService.name,
                      generateInvoice()
                    ]
                  );

                  res.status(200).json({
                    status: 0,
                    message: "Transaksi berhasil",
                    data: {
                      invoice_number: "INV23472389",
                      service_code: dataService.code,
                      service_name: dataService.name,
                      transaction_type: "PAYMENT",
                      total_amount: dataService.tarif,
                      created_on: new Date(),
                    }
                  });
                }
              );
            }
          }
        );
      }
    }
  );
})

app.get('/transaction/history', verifyToken, (req, res) => {
  console.log('Transaction History');
  console.log('Request params:', req.query);
  console.log('Request body:', req.body);

  const userData = req.user;
  console.log('userData:', userData);

  let dataTransaction

  let limit = req.query.limit || 0
  let offset = req.query.offset || 0  

  console.log('limit ', limit)
  console.log('offset ', offset)

  if (limit > 0) {
    connection.execute(
      `SELECT * FROM transaction where user_id = ? order by created_on desc limit ? offset ? `,
      [req.user.user_id, limit, offset],
      async (error, rows, fields) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            status: 999,
            message: "System error"
          });
        }
  
        dataTransaction = rows
  
        console.log('dataTransaction ', dataTransaction)
  
        return res.status(200).json({
          status: 0,
          message: "Get History Berhasil",
          data: {
            offset: offset,
            limit: limit,
            records: dataTransaction
          }
        });
      }
    );
  } else {
    connection.execute(
      `SELECT * FROM transaction where user_id = ? order by created_on desc`,
      [req.user.user_id],
      async (error, rows, fields) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            status: 999,
            message: "System error"
          });
        }
  
        dataTransaction = rows
  
        console.log('dataTransaction ', dataTransaction)
  
        return res.status(200).json({
          status: 0,
          message: "Get History Berhasil",
          data: {
            offset: offset,
            limit: limit,
            records: dataTransaction
          }
        });
      }
    );
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})