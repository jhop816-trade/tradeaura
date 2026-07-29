export default function GoldAurora() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div style={{
        position: 'absolute',
        width: '700px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(212,168,83,0.09) 0%, transparent 68%)',
        top: '-15%',
        left: '15%',
        animation: 'aurora1 14s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '550px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(212,168,83,0.07) 0%, transparent 68%)',
        bottom: '-10%',
        right: '8%',
        animation: 'aurora2 17s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(180,130,50,0.05) 0%, transparent 68%)',
        top: '35%',
        left: '55%',
        animation: 'aurora3 20s ease-in-out infinite',
      }} />
    </div>
  )
}
