import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import './UserProfilePage.css'

function UserProfilePage() {
  const { currentUser, updateName, logout } = useAuth()
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!currentUser) return null

  function startEditing() {
    setNameDraft(currentUser!.name)
    setError(null)
    setIsEditingName(true)
  }

  async function handleSave() {
    const result = await updateName(nameDraft)
    if (result.ok) {
      setIsEditingName(false)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="UserProfilePage">
      <div className="UserProfilePage-card">
        <h2>Meu perfil</h2>
        {error && <p className="UserProfilePage-error">{error}</p>}

        {isEditingName ? (
          <div className="UserProfilePage-nameEdit">
            <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
            <button type="button" onClick={handleSave}>
              Salvar
            </button>
            <button type="button" onClick={() => setIsEditingName(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <p>
            Nome: {currentUser.name}{' '}
            <button type="button" onClick={startEditing}>
              Editar
            </button>
          </p>
        )}

        <p>E-mail: {currentUser.email}</p>

        <button type="button" onClick={logout}>
          Sair
        </button>
      </div>
    </div>
  )
}

export default UserProfilePage
