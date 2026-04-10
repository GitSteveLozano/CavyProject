import { useState, useRef } from 'react'
import { TH } from '../lib/theme'
import { Card, Btn, SectionLabel } from './Atoms'

export function Documents({ projectId }) {
  const [files, setFiles]     = useState([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleUpload = async (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    setUploading(true)
    try {
      // TODO: upload to Supabase Storage
      const newFiles = selected.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
      }))
      setFiles(prev => [...prev, ...newFiles])
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="page-pad" style={{ padding: '32px 36px', maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: TH.text, margin: 0, marginBottom: 4 }}>
        Documents
      </h1>
      <div style={{ fontSize: 13, color: TH.muted, marginBottom: 24 }}>
        Project files &middot; blueprints, photos, permits
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      <Btn onClick={() => inputRef.current?.click()} disabled={uploading} style={{ marginBottom: 20 }}>
        {uploading ? 'Uploading...' : 'Upload files'}
      </Btn>

      {files.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 0', color: TH.muted, fontSize: 13 }}>
            No documents yet. Upload blueprints, photos, or permits.
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${TH.border}` }}>
            <SectionLabel>Uploaded files</SectionLabel>
          </div>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 18px',
              borderBottom: i < files.length - 1 ? `1px solid ${TH.border}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 13, color: TH.text }}>{f.name}</div>
                <div style={{ fontSize: 11, color: TH.muted }}>{formatSize(f.size)}</div>
              </div>
              <div style={{ fontSize: 11, color: TH.muted }}>
                {new Date(f.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
