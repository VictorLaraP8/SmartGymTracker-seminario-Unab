const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido o expirado',
    });
  }
};

const isTrainer = (req, res, next) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({
      message: 'Acceso solo para entrenadores',
    });
  }

  next();
};

const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      message: 'Acceso solo para alumnos',
    });
  }

  next();
};

module.exports = {
  verifyToken,
  isTrainer,
  isUser,
};
