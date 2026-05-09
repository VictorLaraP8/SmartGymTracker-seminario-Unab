function StatCard({ title, value, hint, tone = 'blue' }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <p>{title}</p>
      <h3>{value}</h3>
      <small>{hint}</small>
    </article>
  );
}

export default StatCard;
