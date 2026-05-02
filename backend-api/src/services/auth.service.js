const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password) {
    throw new Error('Todos los campos son obligatorios');
  }

  const existingUser = await userModel.findUserByEmail(email);

  if (existingUser) {
    throw new Error('El correo ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.createUser({
    name,
    email,
    password: hashedPassword,
    role: role || 'user',
  });

  return newUser;
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios');
  }

  const user = await userModel.findUserByEmail(email);

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
};