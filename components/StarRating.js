export default function StarRating({ value = 0, size }) {
  const full = Math.round(value);
  return (
    <span
      className="star-row"
      style={size ? { fontSize: size } : undefined}
      aria-label={`${value} out of 5 stars`}
    >
      {"★".repeat(full)}
      <span style={{ opacity: 0.35 }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}
