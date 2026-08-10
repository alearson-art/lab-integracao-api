process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

describe('API de Alunos', () => {

    beforeEach((done) => 
        {db.run('DELETE FROM alunos', done);
    });

    describe('Caminho Feliz', () => {
        test('Deve criar um aluno com sucesso e salvar no banco de dados', async () => {
            
            const novoAluno = {
                nome: 'Fulano',
                matricula: '12345'
            };

            const resposta = await request(app)
                .post('/alunos')
                .send(novoAluno);

          
            expect(resposta.status).toBe(201);
            expect(resposta.body).toHaveProperty('id');

        
            const alunoNoBanco = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM alunos WHERE id = ?', [resposta.body.id], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            expect(alunoNoBanco).toBeDefined();
        });
    });

    describe('Conflitos e Validações de Dados', () => {

        test('Deve retornar Status 400 e mensagem "Dados incompletos"', async () => {
            const alunoIncompleto = {
                nome: 'Fulano Sem Matricula',
        
            };
            
            const resposta = await request(app)
                .post('/alunos')
                .send(alunoIncompleto);

            expect(resposta.status).toBe(400);
            expect(resposta.body.mensagem).toBe('Dados incompletos');

            const totalAlunos = await new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) as total FROM alunos', (err, row) => {
                    if (err) reject(err);
                    resolve(row.total);
                });
            });
            expect(totalAlunos).toBe(0);
        });

         test('Deve retornar Status 409 e mensagem "Matrícula já existe"', async () => {
            const alunoMaria = {
                nome: 'Maria',
                matricula: '2026123'
            };

            const alunoJoao = {
                nome: 'João',
                matricula: '2026123'
            };

            const primeiroPost = await request(app)
                .post('/alunos')
                .send(alunoMaria);
            expect(primeiroPost.status).toBe(201);

            const segundoPost = await request(app)
                .post('/alunos')
                .send(alunoJoao);

            expect(segundoPost.status).toBe(409);
            expect(segundoPost.body.mensagem).toBe('Matrícula já existe');
        });
    });  
});