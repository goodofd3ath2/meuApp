const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); // ✅ Esse é o middleware correto para JSON

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'faculdade',
  password: 'root1',
  port: 5432,
  client_encoding: 'utf8',
});


// Rota para registrar um usuário
app.post('/register', async (req, res) => {
  console.log('Requisição recebida para registrar usuário:', req.body); // Verificando os dados recebidos
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO usuarios (email, password) VALUES ($1, $2)', [email, hashedPassword]);
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});





// Rota para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    // Compara a senha criptografada
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({ message: 'Login bem-sucedido' });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
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

// Rota para buscar descrições (anotações)
// Se for informado o parâmetro "cadeira", filtra por ele.
app.get('/api/descricoes', async (req, res) => {
  const { data, cadeira } = req.query;
  
  if (data) {
    try {
      const result = await pool.query('SELECT * FROM descricoes WHERE data_Hora::date = $1', [data]);
      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar descrições por data:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar descrições' });
    }
  } else if (cadeira) {
    try {
      const trimmedCadeira = cadeira.trim();
      const result = await pool.query('SELECT * FROM descricoes WHERE cadeira ILIKE $1', [trimmedCadeira]);
      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar descrições por cadeira:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar descrições' });
    }
  } else {
    return res.status(400).json({ error: 'Data ou cadeira não informada.' });
  }
});


// Endpoint para excluir uma anotação pelo ID
app.delete('/api/descricoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM descricoes WHERE id = $1', [id]);
    res.json({ message: 'Anotação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir anotação:', error.message);
    res.status(500).json({ error: 'Erro ao excluir anotação.' });
  }
});


// Rota para salvar descrições
app.post('/api/descricoes', async (req, res) => {
  const { cadeira, descricao, dataHora } = req.body;

  if (!cadeira || !descricao) {
    return res.status(400).json({ error: 'Cadeira e descrição são obrigatórios.' });
  }

  try {
    // Inserindo a nova descrição no banco de dados
    const result = await pool.query(
      'INSERT INTO descricoes (cadeira, descricao, data_Hora) VALUES ($1, $2, $3) RETURNING *',
      [cadeira, descricao, dataHora]
    );
    
    res.status(201).json(result.rows[0]);  // Retornando a descrição inserida
  } catch (error) {
    console.error('Erro ao salvar a descrição:', error.message);
    res.status(500).json({ error: 'Erro ao salvar a descrição' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
