describe('Pruebas unitarias - Métricas SmartGym', () => {

  const calcularVolumen = (ejercicios) =>
    ejercicios.reduce(function(total, e) { return total + e.series * e.reps * e.peso; }, 0);

  const calcularAdherencia = (entrenosRealizados, metaSemanal) =>
    Math.min(Math.round((entrenosRealizados / metaSemanal) * 100), 100);

  const calcularRacha = (fechas) => {
    if (!fechas.length) return 0;
    var racha = 1;
    var sorted = fechas.slice().sort(function(a, b) { return new Date(b) - new Date(a); });
    for (var i = 0; i < sorted.length - 1; i++) {
      var diff = (new Date(sorted[i]) - new Date(sorted[i + 1])) / 86400000;
      if (diff === 1) racha++;
      else break;
    }
    return racha;
  };

  describe('calcularVolumen', () => {
    test('calcula volumen correctamente', () => {
      var ejercicios = [
        { series: 3, reps: 10, peso: 50 },
        { series: 4, reps: 8, peso: 60 }
      ];
      expect(calcularVolumen(ejercicios)).toBe(3420);
    });
    test('retorna 0 si no hay ejercicios', () => {
      expect(calcularVolumen([])).toBe(0);
    });
  });

  describe('calcularAdherencia', () => {
    test('calcula 100% cuando se cumple la meta', () => {
      expect(calcularAdherencia(3, 3)).toBe(100);
    });
    test('calcula porcentaje parcial correctamente', () => {
      expect(calcularAdherencia(2, 4)).toBe(50);
    });
    test('no supera el 100% aunque se exceda la meta', () => {
      expect(calcularAdherencia(5, 3)).toBe(100);
    });
    test('retorna 0 si no hay entrenos', () => {
      expect(calcularAdherencia(0, 3)).toBe(0);
    });
  });

  describe('calcularRacha', () => {
    test('calcula racha de 3 días consecutivos', () => {
      var fechas = ['2026-05-12', '2026-05-13', '2026-05-14'];
      expect(calcularRacha(fechas)).toBe(3);
    });
    test('retorna 1 si solo hay un entreno', () => {
      expect(calcularRacha(['2026-05-14'])).toBe(1);
    });
    test('retorna 0 si no hay fechas', () => {
     expect(calcularRacha([])).toBe(0);
    });
    test('corta la racha cuando hay un día de descanso', () => {
      var fechas = ['2026-05-10', '2026-05-13', '2026-05-14'];
      expect(calcularRacha(fechas)).toBe(2);
    });
  });

});
