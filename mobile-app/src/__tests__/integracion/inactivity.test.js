describe('Pruebas de integración - Alerta de inactividad', () => {

  const calcularDiasSinEntrenar = (ultimaFecha) => {
    if (!ultimaFecha) return null;
    const hoy = new Date('2026-05-14');
    const ultima = new Date(ultimaFecha);
    return Math.floor((hoy - ultima) / 86400000);
  };

  const generarAlertaInactividad = (dias) => {
    if (dias === null) return { tipo: 'sin_historial', mensaje: 'Aún no tienes entrenos registrados' };
    if (dias === 0) return { tipo: 'activo', mensaje: 'Entrenaste hoy, ¡excelente!' };
    if (dias <= 2) return { tipo: 'reciente', mensaje: 'Último entreno hace ' + dias + ' día(s)' };
    if (dias <= 7) return { tipo: 'alerta', mensaje: 'Llevas ' + dias + ' días sin entrenar' };
    return { tipo: 'critico', mensaje: 'Llevas ' + dias + ' días inactivo, ¡vuelve al gym!' };
  };

  test('detecta usuario activo hoy', () => {
    const dias = calcularDiasSinEntrenar('2026-05-14');
    const alerta =generarAlertaInactividad(dias);
    expect(alerta.tipo).toBe('activo');
  });

  test('genera alerta leve entre 3 y 7 días', () => {
    const dias = calcularDiasSinEntrenar('2026-05-09');
    const alerta = generarAlertaInactividad(dias);
    expect(alerta.tipo).toBe('alerta');
    expect(dias).toBe(5);
  });

  test('genera alerta crítica después de 7 días', () => {
    const dias = calcularDiasSinEntrenar('2026-05-01');
    const alerta = generarAlertaInactividad(dias);
    expect(alerta.tipo).toBe('critico');
  });

  test('maneja usuario sin historial', () => {
    const alerta = generarAlertaInactividad(null);
    expect(alerta.tipo).toBe('sin_historial');
  });

});
