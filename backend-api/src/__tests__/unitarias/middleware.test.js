describe('Pruebas unitarias - Middlewares', () => {

    const mockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
  
    describe('verifyToken (simulado)', () => {
      const jwt = require('jsonwebtoken');
      const SECRET = 'smartgym_secret';
  
      const verifyToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
        const token = authHeader.split(' ')[1];
        try {
          req.user = jwt.verify(token, SECRET);
          next();
        } catch {
          return res.status(401).json({ message: 'Token inválido' });
        }
      };
  
      test('rechaza request sin token', () => {
        const req = { headers: {} };
        const res = mockRes();
        const next = jest.fn();
        verifyToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
      });
  
      test('permite request con token válido', () => {
        const token = jwt.sign({ id: 1, role: 'user' }, SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = jest.fn();
        verifyToken(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.id).toBe(1);
      });
    });
  
    describe('isTrainer (simulado)', () => {
      const isTrainer = (req, res, next) => {
        if (req.user?.role !== 'trainer')
          return res.status(403).json({ message: 'Solo entrenadores' });
        next();
      };
  
      test('bloquea a usuarios con rol user', () => {
        const req = { user: { role: 'user' } };
        const res = mockRes();
        const next = jest.fn();
        isTrainer(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
      });
  
      test('permite a usuarios con rol trainer', () => {
        const req = { user: { role: 'trainer' } };
        const res = mockRes();
        const next = jest.fn();
        isTrainer(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });
  
  });