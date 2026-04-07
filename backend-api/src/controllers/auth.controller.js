const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await authService.registerUser({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    return res.status(200).json({
      message: 'Login exitoso',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};