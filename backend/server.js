const express = require('express');
const { Pool } = require('pg');  // Conectar ao PostgreSQL

const app = express();
const port = 5000;

// Conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'faculdade',
  password: 'root1',
  port: 5432,
});

// Testando a conexão com o banco de dados
pool.connect((err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.stack);
  } else {
    console.log('Conectado ao banco de dados');
  }
});

// Criar uma rota para pegar as cadeiras
app.get('/cadeiras', (req, res) => {
  pool.query('SELECT * FROM cadeiras', (err, result) => {
    if (err) {
      res.status(500).send('Erro ao consultar o banco de dados');
    } else {
      res.json(result.rows);
    }
  });
});

// Rodar o servidor na porta 5000
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
