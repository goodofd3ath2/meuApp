const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'faculdade',
  password: 'root1',
  port: 5432,
  client_encoding: 'utf8',
});

/* 
  Estrutura:
  - Tabela curso: (id, nome)
  - Tabela usuarios: (id, email, password, curso_id)
  - Tabela cadeiras: (id, nome, curso_id)
  - Tabela descricoes: (id, cadeira, descricao, data_hora, tipo, user_id)
*/

/* ROTAS DE USUÁRIO */
// Registro: recebe email, password e curso_id (número)
app.post('/register', async (req, res) => {
  const { email, password, curso_id } = req.body;
  if (!email || !password || !curso_id) {
    return res.status(400).json({ message: 'Preencha email, senha e curso.' });
  }
  // Validação de domínio de e-mail: somente @sou.urcamp.edu.br
  const emailRegex = /^[a-zA-Z0-9._%+-]+@sou\.urcamp\.edu\.br$/;
  if (!emailRegex.test(email.toLowerCase())) {
    return res.status(400).json({ message: 'O email deve ser do domínio @sou.urcamp.edu.br' });
  }
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário já cadastrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      'INSERT INTO usuarios (email, password, curso_id) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, curso_id]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login: retorna os dados do usuário (incluindo id e curso_id)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({ message: 'Login bem-sucedido', user });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

/* ROTAS DE CADEIRAS */
// Retorna as cadeiras filtradas pelo curso_id
app.get('/api/cadeiras', async (req, res) => {
  const { curso_id } = req.query;
  let query = 'SELECT id, nome FROM cadeiras';
  let values = [];
  if (curso_id) {
    query += ' WHERE curso_id = $1';
    values.push(curso_id);
  }
  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar cadeiras:', error.message);
    res.status(500).json({ error: 'Erro ao buscar cadeiras' });
  }
});

/* ROTAS DE DESCRICOES (ANOTAÇÕES) */
// Suporte a filtros: data, cadeira, tipo e user_id
app.get('/api/descricoes', async (req, res) => {
  const { data, cadeira, tipo, user_id } = req.query;
  
  let query = `SELECT id, cadeira, descricao, data_hora, tipo, user_id FROM descricoes`;
  let conditions = [];
  let values = [];
  let index = 1;
  
  if (data) {
    conditions.push(`data_hora::date = $${index}`);
    values.push(data);
    index++;
  }
  if (cadeira) {
    conditions.push(`cadeira ILIKE $${index}`);
    values.push(cadeira.trim());
    index++;
  }
  if (tipo) {
    conditions.push(`tipo = $${index}`);
    values.push(tipo.trim());
    index++;
  }
  if (user_id) {
    conditions.push(`user_id = $${index}`);
    values.push(user_id);
    index++;
  }
  
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += " ORDER BY data_hora ASC";
  
  try {
    const result = await pool.query(query, values);
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar descrições:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar descrições' });
  }
});

// Salvar uma descrição (POST)
app.post('/api/descricoes', async (req, res) => {
  const { cadeira, descricao, dataHora, tipo, user_id } = req.body;
  if (!cadeira || !descricao || !dataHora || !user_id) {
    return res.status(400).json({ error: 'Cadeira, descrição, dataHora e user_id são obrigatórios.' });
  }
  const finalTipo = tipo || 'anotacao';
  try {
    const result = await pool.query(
      `INSERT INTO descricoes (cadeira, descricao, data_hora, tipo, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cadeira, descricao, dataHora, finalTipo, user_id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar a descrição:', error.message);
    res.status(500).json({ error: 'Erro ao salvar a descrição' });
  }
});

// Atualizar uma descrição (PUT)
app.put('/api/descricoes/:id', async (req, res) => {
  const { id } = req.params;
  const { cadeira, descricao, dataHora, tipo, user_id } = req.body;
  if (!cadeira || !descricao || !dataHora || !user_id) {
    return res.status(400).json({ error: 'Cadeira, descrição, dataHora e user_id são obrigatórios.' });
  }
  const finalTipo = tipo || 'anotacao';
  try {
    const result = await pool.query(
      `UPDATE descricoes
       SET cadeira = $1, descricao = $2, data_hora = $3, tipo = $4, user_id = $5
       WHERE id = $6
       RETURNING *`,
      [cadeira, descricao, dataHora, finalTipo, user_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anotação não encontrada.' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar descrição:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar descrição' });
  }
});

// Excluir uma descrição (DELETE)
app.delete('/api/descricoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM descricoes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Anotação não encontrada para exclusão.' });
    }
    res.json({ message: 'Anotação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir anotação:', error.message);
    res.status(500).json({ error: 'Erro ao excluir anotação.' });
  }
});

// Rota para buscar todos os cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome FROM curso ORDER BY nome ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error.message);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
