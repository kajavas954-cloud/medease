require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function migrate() {
  let log = "";
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'medease'
    });

    log += 'Connected to MySQL directly.\n';

    const queries = [
      "ALTER TABLE Users ADD COLUMN age INT NULL;",
      "ALTER TABLE Users ADD COLUMN gender VARCHAR(255) NULL;",
      "ALTER TABLE Users ADD COLUMN bloodGroup VARCHAR(255) NULL;",
      "ALTER TABLE Users ADD COLUMN profilePicUrl TEXT NULL;"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        log += 'SUCCESS: ' + q + '\n';
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          log += 'COMPLETED ALREADY (Field exists): ' + q + '\n';
        } else {
          log += 'ERROR executing ' + q + ': ' + err.message + '\n';
        }
      }
    }

    await connection.end();
    log += 'Migration finished successfully.\n';

  } catch (error) {
    log += 'Failed to connect or migrate: ' + error.message + '\n';
  } finally {
    fs.writeFileSync('migration.log', log);
    process.exit();
  }
}

migrate();
