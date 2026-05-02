const userModel = require('../models/user.model');
const bodyProgressModel = require('../models/body_progress.model');

const computeImc = (pesoKg, alturaCm) => {
  const p = Number(pesoKg);
  const h = Number(alturaCm) / 100;
  if (!Number.isFinite(p) || !Number.isFinite(h) || h <= 0) {
    return null;
  }
  return Math.round((p / (h * h)) * 100) / 100;
};

const getMyProfile = async (userId) => {
  const user = await userModel.findUserByIdSafe(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user;
};

const sanitizePatch = (body) => {
  const out = {};

  if (typeof body.name === 'string') {
    const n = body.name.trim();
    if (!n) {
      throw new Error('El nombre no puede estar vacío');
    }
    out.name = n;
  }

  if (body.edad !== undefined) {
    if (body.edad === null || body.edad === '') {
      out.edad = null;
    } else {
      const e = parseInt(body.edad, 10);
      if (Number.isNaN(e) || e < 0 || e > 120) {
        throw new Error('Edad inválida');
      }
      out.edad = e;
    }
  }

  if (body.altura_cm !== undefined) {
    if (body.altura_cm === null || body.altura_cm === '') {
      out.altura_cm = null;
    } else {
      const h = Number(body.altura_cm);
      if (Number.isNaN(h) || h < 50 || h > 300) {
        throw new Error('Altura inválida (usa centímetros entre 50 y 300)');
      }
      out.altura_cm = h;
    }
  }

  if (body.objetivo !== undefined) {
    out.objetivo =
      body.objetivo === null || body.objetivo === ''
        ? null
        : String(body.objetivo).slice(0, 255);
  }

  if (body.account_status !== undefined) {
    const s = String(body.account_status).toLowerCase();
    if (s !== 'active' && s !== 'inactive') {
      throw new Error('Estado de cuenta inválido');
    }
    out.account_status = s;
  }

  return out;
};

const updateMyProfile = async (userId, body) => {
  const patch = sanitizePatch(body);
  if (Object.keys(patch).length === 0) {
    throw new Error('No hay campos válidos para actualizar');
  }
  const updated = await userModel.updateUserProfile(userId, patch);
  if (!updated) {
    throw new Error('Usuario no encontrado');
  }
  return updated;
};

const getMyProgress = async (userId) => {
  return bodyProgressModel.listByUserId(userId);
};

const createMyProgress = async (userId, body) => {
  if (!body.fecha) {
    throw new Error('La fecha es obligatoria (formato YYYY-MM-DD)');
  }

  const obs = body.observacion != null ? String(body.observacion).trim() : '';
  const hasPeso = body.peso_corporal != null && body.peso_corporal !== '';
  const hasGrasa = body.porcentaje_grasa != null && body.porcentaje_grasa !== '';
  const hasMasa = body.masa_muscular != null && body.masa_muscular !== '';
  const hasObs = obs.length > 0;

  if (!hasPeso && !hasGrasa && !hasMasa && !hasObs) {
    throw new Error(
      'Indica al menos peso corporal, porcentaje de grasa, masa muscular u observación'
    );
  }

  const user = await userModel.findUserByIdSafe(userId);
  let imc =
    body.imc != null && body.imc !== '' && !Number.isNaN(Number(body.imc))
      ? Number(body.imc)
      : null;
  if (imc === null || Number.isNaN(imc)) {
    imc = computeImc(body.peso_corporal, user?.altura_cm);
  }

  const row = await bodyProgressModel.upsertProgress(userId, {
    fecha: body.fecha,
    peso_corporal: hasPeso ? Number(body.peso_corporal) : null,
    porcentaje_grasa: hasGrasa ? Number(body.porcentaje_grasa) : null,
    masa_muscular: hasMasa ? Number(body.masa_muscular) : null,
    imc,
    observacion: hasObs ? obs : null,
  });

  return row;
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyProgress,
  createMyProgress,
};
