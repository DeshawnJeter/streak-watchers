const COLORS = ['#58CC02', '#FFC800', '#FF9600', '#1CB0F6', '#CE82FF', '#FF4B4B'];
const PIECES = 18;

export default function Confetti() {
  const pieces = Array.from({ length: PIECES }, (_, i) => {
    const color = COLORS[i % COLORS.length];
    const left = `${5 + (i / PIECES) * 90}%`;
    const delay = `${(i * 0.07).toFixed(2)}s`;
    const duration = `${0.7 + Math.random() * 0.5}s`;
    const size = 6 + (i % 3) * 3;
    const shape = i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0%';
    return { color, left, delay, duration, size, shape };
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: 'inherit',
        zIndex: 10,
      }}
    >
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
