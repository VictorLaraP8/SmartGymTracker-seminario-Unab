const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Perfil obtenido correctamente',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener perfil',
    });
  }
};

module.exports = {
  getProfile,
};
