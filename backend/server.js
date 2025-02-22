const express = require('express');
const { Pool } = require('pg'); // Conectar ao PostgreSQL

const app = express();
const port = 5000;

app.use(express.json()); // Middleware para lidar com JSON no request body

// Conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'faculdade',
  password: 'root1',
  port: 5432,
  client_encoding: 'utf8'  // 🔹 Força UTF-8 na conexão

});

// Rota para pegar as cadeiras
app.get('/api/cadeiras', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome FROM cadeiras');
    
    const cadeirasFormatadas = result.rows.map(cadeira => ({
      id: cadeira.id,
      nome: cadeira.nome.normalize("NFC")  // 🔹 Normaliza para UTF-8
    }));

    res.setHeader('Content-Type', 'application/json; charset=utf-8'); // 🔹 Garante UTF-8 na resposta
    res.json(cadeirasFormatadas);
  } catch (error) {
    console.error('Erro ao buscar cadeiras:', error.message);
    res.status(500).json({ error: 'Erro ao buscar cadeiras' });
  }
});



// Rota para buscar descrições por cadeira
app.get('/api/descricoes', async (req, res) => {
  const { cadeira } = req.query;
  console.log('Valor recebido para cadeira:', cadeira); // Log do valor recebido da query

  if (!cadeira) {
    return res.status(400).json({ error: 'Cadeira não informada.' });
  }

  try {
    const trimmedCadeira = cadeira.trim(); // Aplicando o TRIM
    console.log('Valor da cadeira após TRIM:', trimmedCadeira); // Verificando após o TRIM

    // Alterando a consulta para usar ILIKE
    const result = await pool.query('SELECT * FROM descricoes WHERE cadeira ILIKE $1', [trimmedCadeira]);
    console.log('Descrições encontradas:', result.rows); // Resultado da consulta

    if (result.rows.length === 0) {
      console.log('Nenhuma descrição encontrada para a cadeira fornecida.');
      return res.status(404).json({ message: 'Nenhuma descrição encontrada para a cadeira fornecida.' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar descrições:', error.message);
    res.status(500).json({ error: 'Erro ao buscar descrições' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
