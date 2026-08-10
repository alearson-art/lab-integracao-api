const express = require('express');
const db = require('./database');
const app = express();
app.use(express.json());
app.post('/alunos'

, (req, res) => {

const { nome, matricula } = req.body;
if (!nome || !matricula) return res.status(400).json({ mensagem: 'Dados incompletos' });
const sql = 'INSERT INTO alunos (nome, matricula) VALUES (?, ?)';
db.run(sql, [nome, matricula], function(err) {
if (err) return res.status(409).json({ mensagem: 'Matrícula já existe' });
res.status(201).json({ id: this.lastID, nome, matricula });
});
});
module.exports = app;