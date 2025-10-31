const express = require('express')
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const verifyToken = require('./middleware/auth');

const app = express()
const port = 3000



// Add middleware to parse JSON and URL-encoded bodies
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Folder penyimpanan
  },
  filename: function (req, file, cb) {
    // Nama file: timestamp + original name
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
});

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'exam',
  password: 'Ultraman2!'
});

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
  await connection.execute(
    `UPDATE users 
     SET first_name = ?, last_name = ?
     WHERE id = ?`,
    [
      req.body.first_name,
      req.body.last_name,
      userData.user_id // dari token
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

app.put('/profile/image', upload.single('image'), verifyToken, (req, res) => {
  const userData = req.user;
  // Validasi img must jpeg/jpg/png
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      status: 102,
      message: 'Format Image tidak sesuai',
      data: null
    });
  } else {
    

    connection.execute(
      `UPDATE users 
        SET profile_image = ?
        WHERE id = ?`,
      [
        req.file.filename,
        userData.user_id 
      ]
    );
  }

  return res.status(200).json({
    status: 0,
    message: "Update Profile Image berhasil",
    data: {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      profile_image: req.file.filename   
    }
  });
})

app.get('/banner', (req, res) => {
  connection.execute(
    `SELECT * FROM banner`,
    (error, rows, fields) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          status: 999,
          message: "System error"
        });
      }
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
  connection.execute(
    `SELECT * FROM services`,
    (error, rows, fields) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          status: 999,
          message: "System error"
        });
      }
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
  const userData = req.user;
  connection.execute(
    `SELECT balance FROM users where id = ?`,
    [userData.user_id],
    (error, rows, fields) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          status: 999,
          message: "System error"
        });
      }

      const balance = rows[0].balance

      res.status(200).json({
        status: 0,
        message: "Get Balance Berhasil",
        balance: balance
      });
    }
  );

})

app.post('/topup', verifyToken, async (req, res) => {
  const userData = req.user;
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
      [userData.user_id],
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

        //Update balance to db
        await connection.execute(
          `UPDATE users 
            SET balance = ?
            WHERE id = ?`,
          [
            totalBalance,
            userData.user_id // dari token
          ]
        );

        //Insert transaction record
        await connection.execute(
          `INSERT INTO transaction (user_id, nominal, type, description, inv) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            userData.user_id,
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
  const userData = req.user;

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
          [userData.user_id],
          (error, rows, fields) => {
            if (error) {
              console.error('Database error:', error);
              return res.status(500).json({
                status: 999,
                message: "System error"
              });
            }

            let userBalance = rows[0].balance

            //Cek Saldo
            if (userBalance < dataService.tarif) {
              return res.status(502).json({
                status: 102,
                message: "Saldo tidak cukup. Pastikan saldo anda cukup untuk melakukan transaksi",
              });
            } else {
              //Saldo cukup
              connection.execute(
                `SELECT balance FROM users where id = ?`,
                [userData.user_id],
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
                      userData.user_id // dari token
                    ]
                  );

                  //Insert transaction record
                  await connection.execute(
                    `INSERT INTO transaction (user_id, nominal, type, description, inv) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                      userData.user_id,
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
  const userData = req.user;

  let dataTransaction

  let limit = req.query.limit || 0
  let offset = req.query.offset || 0  

  if (limit > 0) {
    connection.execute(
      `SELECT * FROM transaction where user_id = ? order by created_on desc limit ? offset ? `,
      [userData.user_id, limit, offset],
      async (error, rows, fields) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            status: 999,
            message: "System error"
          });
        }
  
        dataTransaction = rows
  
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
      [userData.user_id],
      async (error, rows, fields) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            status: 999,
            message: "System error"
          });
        }
  
        dataTransaction = rows
  
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