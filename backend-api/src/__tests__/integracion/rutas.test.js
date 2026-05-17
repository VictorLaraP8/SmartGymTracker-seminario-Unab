const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'smartgym_secret';

const app = express();
app.use(express.json());

const verifyToken = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'Token requerido' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/protected', verifyToken, (req, res) =>
  res.json({ message: 'acceso permitido', user: req.user })
);
app.get('/api/trainer-only', verifyToken, (req, res) => {
  if (req.user.role !== 'trainer')
    return res.status(403).json({ message: 'Solo entrenadores' });
  res.json({ message: 'bienvenido entrenador' });
});

describe('Pruebas de integración - Rutas SmartGym', () => {

  test('GET /api/health retorna 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('Ruta protegida sin token retorna 401', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.statusCode).toBe(401);
  });

  test('Ruta protegida con token válido retorna 200', async () => {
    const token = jwt.sign({ id: 1, role: 'user' }, SECRET);
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe(1);
  });

  test('Ruta trainer con rol user retorna 403', async () => {
    const token = jwt.sign({ id: 1, role: 'user' }, SECRET);
    const res = await request(app)
      .get('/api/trainer-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  test('Ruta trainer con rol trainer retorna 200', async () => {
    const token = jwt.sign({ id: 2, role: 'trainer' }, SECRET);
    const res = await request(app)
      .get('/api/trainer-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('bienvenido entrenador');
  });

});