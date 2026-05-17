describe('Pruebas unitarias - Auth mobile', () => {

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarPassword = (pass) => typeof pass === 'string' && pass.length >= 6;

  describe('validarEmail', () => {
    test('acepta email válido', () => {
      expect(validarEmail('usuario@gmail.com')).toBe(true);
    });
    test('rechaza email sin @', () => {
      expect(validarEmail('usuariogmail.com')).toBe(false);
    });
    test('rechaza email vacío', () => {
      expect(validarEmail('')).toBe(false);
    });
  });

  describe('validarPassword', () => {
    test('acepta contraseña de 6 o más caracteres', () => {
      expect(validarPassword('abc123')).toBe(true);
    });
    test('rechaza contraseña menor a 6 caracteres', () => {
      expect(validarPassword('abc')).toBe(false);
    });
    test('rechaza contraseña vacía', () => {
      expect(validarPassword('')).toBe(false);
    });
  });

});
