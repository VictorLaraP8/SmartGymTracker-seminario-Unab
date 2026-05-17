const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Pruebas unitarias - Auth', () => {

  describe('bcrypt', () => {
    test('hashea una contraseña correctamente', async () => {
      const hash = await bcrypt.hash('clave123', 10);
      expect(hash).not.toBe('clave123');
    });

    test('valida contraseña correcta', async () => {
      const hash = await bcrypt.hash('clave123', 10);
      expect(await bcrypt.compare('clave123', hash)).toBe(true);
    });

    test('rechaza contraseña incorrecta', async () => {
      const hash = await bcrypt.hash('clave123', 10);
      expect(await bcrypt.compare('incorrecta', hash)).toBe(false);
    });
  });

  describe('JWT', () => {
    const SECRET = 'test_secret';

    test('genera un token válido', () => {
      const token = jwt.sign({ id: 1, role: 'user' }, SECRET, { expiresIn: '1h' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('decodifica el token correctamente', () => {
      const token = jwt.sign({ id: 1, role: 'user' }, SECRET);
      const decoded = jwt.verify(token, SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.role).toBe('user');
    });

    test('falla con token inválido', () => {
      expect(() => jwt.verify('token_falso', SECRET)).toThrow();
    });

    test('distingue rol trainer de rol user', () => {
      const token = jwt.sign({ id: 2, role: 'trainer' }, SECRET);
      const decoded = jwt.verify(token, SECRET);
      expect(decoded.role).toBe('trainer');
      expect(decoded.role).not.toBe('user');
    });
  });

});