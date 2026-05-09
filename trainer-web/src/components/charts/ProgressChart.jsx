function ProgressChart({ data, metricKey = 'volume' }) {
  const maxValue = data.length ? Math.max(...data.map((item) => Number(item[metricKey] || 0))) : 0;

  return (
    <div className="chart-card">
      <div className="chart-grid">
        {data.map((item) => {
          const value = Number(item[metricKey] || 0);
          const height = maxValue > 0 ? Math.max(10, Math.round((value / maxValue) * 100)) : 10;

          return (
            <div className="chart-bar-wrap" key={item.week}>
              <div className="chart-bar" style={{ height: `${height}%` }} title={`${item.week}: ${value}`} />
              <span>{item.week}</span>
            </div>
          );
        })}
      </div>
      {!data.length ? <p className="chart-empty">No hay datos disponibles para este periodo.</p> : null}
    </div>
  );
}

export default ProgressChart;
