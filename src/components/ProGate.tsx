import Link from 'next/link'

interface ProGateProps {
  title: string
  description: string
}

function ProGate({ title, description }: ProGateProps) {
  return (
    <div className="card ProGate">
      <span className="chip ProGate-tag">★ PRO</span>
      <h2 className="ProGate-title">{title}</h2>
      <p className="ProGate-description">{description}</p>
      <Link className="btn-primary" href="/plano">
        CONHECER O PRO
      </Link>
    </div>
  )
}

export default ProGate
