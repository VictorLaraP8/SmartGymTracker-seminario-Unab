import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProgressChart from '../components/charts/ProgressChart';
import { useAuth } from '../context/AuthContext';
import {
  getClientMessages,
  getClientRecommendations,
  getTrainerClients,
  sendClientMessage,
  sendClientRecommendation,
} from '../services/trainerService';
import { getUserWeeklyHistory, getUsersAtRisk, getUsersRanking, mergeClientsWithMetrics } from '../services/usersService';

function UserDetail() {
  const { id } = useParams();
  const userId = Number(id);
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [recTitle, setRecTitle] = useState('');
  const [recBody, setRecBody] = useState('');
  const [sendBusy, setSendBusy] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const [clients, atRisk, ranking] = await Promise.all([getTrainerClients(), getUsersAtRisk(), getUsersRanking()]);
        setUsers(mergeClientsWithMetrics(clients, atRisk, ranking));
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'No fue posible cargar el detalle');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, []);

  const user = useMemo(() => users.find((entry) => entry.id === userId), [users, userId]);
  const history = getUserWeeklyHistory(userId);

  const loadCoachData = useCallback(async () => {
    if (!Number.isFinite(userId) || userId <= 0) return;
    setCoachLoading(true);
    setCoachError('');
    try {
      const [msg, recs] = await Promise.all([getClientMessages(userId), getClientRecommendations(userId)]);
      setMessages(msg);
      setRecommendations(recs);
    } catch (coachErr) {
      setCoachError(coachErr.response?.data?.message || 'No se pudo cargar el módulo COACH');
    } finally {
      setCoachLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!user) return undefined;
    loadCoachData();
    const intervalId = setInterval(loadCoachData, 25000);
    return () => clearInterval(intervalId);
  }, [user, loadCoachData]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmed = messageBody.trim();
    if (!trimmed || !user) return;
    setSendBusy(true);
    setCoachError('');
    try {
      await sendClientMessage(userId, trimmed);
      setMessageBody('');
      await loadCoachData();
    } catch (sendErr) {
      setCoachError(sendErr.response?.data?.message || 'No se pudo enviar el mensaje');
    } finally {
      setSendBusy(false);
    }
  };

  const handleSendRecommendation = async (event) => {
    event.preventDefault();
    if (!user) return;
    setSendBusy(true);
    setCoachError('');
    try {
      await sendClientRecommendation(userId, recTitle.trim(), recBody.trim());
      setRecTitle('');
      setRecBody('');
      await loadCoachData();
    } catch (sendErr) {
      setCoachError(sendErr.response?.data?.message || 'No se pudo crear la recomendación');
    } finally {
      setSendBusy(false);
    }
  };

  if (loading) return <section className="page-loader">Cargando usuario...</section>;
  if (error) return <section className="error-panel">{error}</section>;
  if (!user) {
    return (
      <section className="error-panel">
        Usuario no encontrado en tu cartera de alumnos. <Link to="/users">Volver al listado</Link>
      </section>
    );
  }

  const trainerId = authUser?.id;

  return (
    <section className="page-section">
      <div className="section-header">
        <p className="breadcrumb">
          <Link to="/users">Usuarios</Link>
          <span aria-hidden="true"> / </span>
          <span>{user.name}</span>
        </p>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
      <div className="detail-grid">
        <article className="detail-card">
          <h3>Información general</h3>
          <p>
            Estado: <strong>{user.adherenceStatus}</strong>
          </p>
          <p>Última actividad: {user.lastWorkoutDate ? new Date(user.lastWorkoutDate).toLocaleDateString('es-CL') : 'Sin registros'}</p>
          <p>Días sin entrenar: {user.daysWithoutTraining ?? '—'}</p>
          <p>Volumen total: {history.length ? `${history.reduce((sum, week) => sum + week.volume, 0)} kg` : 'N/D'}</p>
          <p>Frecuencia semanal: {user.frequencyWeekly ?? 'N/D'}</p>
          {!!user.alerts?.length && <p>Alertas: {user.alerts.join(', ')}</p>}
        </article>
        <article className="detail-card">
          <h3>Progreso visual</h3>
          <ProgressChart data={history} metricKey="volume" />
          {!history.length ? (
            <p className="muted">No hay endpoint trainer para historial por alumno. Activa `VITE_USE_MOCKS=true` para demo visual.</p>
          ) : null}
        </article>
      </div>

      <article className="detail-card coach-card">
        <div className="coach-card-header">
          <div>
            <h3>COACH (mensajes)</h3>
            <p className="muted coach-hint">Mismo hilo que el alumno ve en la app en la pestaña COACH. Los mensajes se sincronizan vía API.</p>
          </div>
          <button type="button" className="secondary-button" onClick={loadCoachData} disabled={coachLoading}>
            {coachLoading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
        {coachError ? <p className="form-error coach-inline-error">{coachError}</p> : null}
        <div className="coach-thread" role="log" aria-live="polite">
          {coachLoading && !messages.length ? <p className="muted">Cargando mensajes…</p> : null}
          {!coachLoading && !messages.length ? <p className="muted">Sin mensajes aún. Escribe abajo para iniciar la conversación.</p> : null}
          {messages.map((m) => {
            const fromTrainer = trainerId != null && Number(m.sender_id) === Number(trainerId);
            return (
              <div key={m.id} className={`coach-row ${fromTrainer ? 'coach-row--trainer' : 'coach-row--client'}`}>
                <div className={`coach-bubble ${fromTrainer ? 'coach-bubble--trainer' : 'coach-bubble--client'}`}>
                  <p>{m.body}</p>
                  <time className="coach-time">{new Date(m.created_at).toLocaleString('es-CL')}</time>
                </div>
              </div>
            );
          })}
        </div>
        <form className="coach-form" onSubmit={handleSendMessage}>
          <label htmlFor="coach-message">Nuevo mensaje</label>
          <textarea
            id="coach-message"
            rows={3}
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Escribe un mensaje para tu alumno…"
            maxLength={8000}
          />
          <button type="submit" disabled={sendBusy || !messageBody.trim()}>
            {sendBusy ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </form>
      </article>

      <article className="detail-card coach-card">
        <h3>COACH (recomendaciones)</h3>
        <p className="muted coach-hint">Las recomendaciones aparecen en la app del alumno en COACH.</p>
        <ul className="coach-rec-list">
          {recommendations.map((r) => (
            <li key={r.id} className="coach-rec-item">
              <strong>{r.title}</strong>
              <p>{r.body}</p>
              <time className="coach-time">{new Date(r.created_at).toLocaleString('es-CL')}</time>
            </li>
          ))}
          {!recommendations.length ? <li className="muted">Aún no hay recomendaciones.</li> : null}
        </ul>
        <form className="coach-form" onSubmit={handleSendRecommendation}>
          <label htmlFor="rec-title">Título</label>
          <input id="rec-title" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} maxLength={255} placeholder="Ej. Progresión de carga" />
          <label htmlFor="rec-body">Contenido</label>
          <textarea id="rec-body" rows={3} value={recBody} onChange={(e) => setRecBody(e.target.value)} placeholder="Detalle de la recomendación…" />
          <button type="submit" disabled={sendBusy || !recTitle.trim() || !recBody.trim()}>
            {sendBusy ? 'Guardando…' : 'Enviar recomendación'}
          </button>
        </form>
      </article>
    </section>
  );
}

export default UserDetail;
