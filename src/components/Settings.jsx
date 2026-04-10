import { useState, useEffect } from 'react'
import { TH } from '../lib/theme'
import { Card, Btn, SectionLabel } from './Atoms'
import { supabase, isConfigured } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL  || ''
const QBO_CLIENT_ID = import.meta.env.VITE_QBO_CLIENT_ID || ''
const COMPANY_ID = import.meta.env.VITE_COMPANY_ID || 'default'

export function Settings() {
  const [qboInteg, setQboInteg]       = useState(null)
  const [syncResult, setSyncResult]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [syncing, setSyncing]         = useState(false)
  const [error, setError]             = useState(null)

  // Check URL params for OAuth return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qbo = params.get('qbo')
    if (qbo === 'success') setError(null)
    if (qbo === 'denied') setError('QBO authorization was denied.')
    if (qbo === 'error') setError(`QBO connection failed: ${params.get('msg') || 'unknown error'}`)
    // Clean URL params
    if (qbo) window.history.replaceState({}, '', window.location.pathname)
  }, [])

  // Check QBO connection status
  const checkQboStatus = async () => {
    if (!isConfigured) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('integrations')
        .select('*')
        .eq('company_id', COMPANY_ID)
        .eq('provider', 'qbo')
        .maybeSingle()
      if (err) throw err
      setQboInteg(data)
      if (data?.metadata?.last_sync_results) {
        setSyncResult(data.metadata.last_sync_results)
      }
    } catch (err) {
      console.error('Failed to check QBO status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { checkQboStatus() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connectQBO = () => {
    const redirectUri = `${SUPABASE_URL}/functions/v1/qbo-callback`
    const scope = 'com.intuit.quickbooks.accounting'
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${QBO_CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${COMPANY_ID}`
    window.location.href = authUrl
  }

  const handleSyncQBO = async () => {
    setSyncing(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.functions.invoke('qbo-sync', {
        body: { company_id: COMPANY_ID },
      })
      if (err) throw err
      if (data?.results) setSyncResult(data.results)
      await checkQboStatus()
    } catch (err) {
      setError(`Sync failed: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const disconnectQBO = async () => {
    if (!confirm('Disconnect QuickBooks Online?')) return
    try {
      await supabase
        .from('integrations')
        .delete()
        .eq('company_id', COMPANY_ID)
        .eq('provider', 'qbo')
      setQboInteg(null)
      setSyncResult(null)
    } catch (err) {
      setError(`Disconnect failed: ${err.message}`)
    }
  }

  return (
    <div className="page-pad" style={{ padding: '32px 36px', maxWidth: 660 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: TH.text, margin: 0, marginBottom: 4 }}>Settings</h1>
      <div style={{ fontSize: 13, color: TH.muted, marginBottom: 28 }}>Integrations &middot; company configuration</div>

      {error && (
        <Card style={{ marginBottom: 16, border: `1px solid ${TH.red}55` }}>
          <div style={{ fontSize: 13, color: TH.red }}>{error}</div>
        </Card>
      )}

      {/* QBO Integration */}
      <SectionLabel>QuickBooks Online</SectionLabel>

      {!isConfigured ? (
        <Card>
          <div style={{ fontSize: 13, color: TH.muted }}>
            Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment variables to enable integrations.
          </div>
        </Card>
      ) : loading ? (
        <Card><div style={{ color: TH.muted, fontSize: 13 }}>Checking connection...</div></Card>
      ) : !qboInteg ? (
        <Card>
          <div style={{ fontSize: 13, color: TH.muted, marginBottom: 14 }}>
            Connect QuickBooks to sync bills, time entries, and project estimates.
          </div>
          <Btn onClick={connectQBO}>Connect QuickBooks Online</Btn>
        </Card>
      ) : (
        /* Connected state */
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: TH.green, display: 'inline-block',
              }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: TH.green }}>Connected</span>
              {qboInteg.metadata?.sandbox && (
                <span style={{
                  fontSize: 9, background: TH.amber + '22', color: TH.amber,
                  padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase', fontWeight: 600,
                }}>Sandbox</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: TH.muted }}>
              Realm: {qboInteg.realm_id}
            </div>
          </div>

          {/* Last sync info */}
          {qboInteg.last_sync_at && (
            <div style={{ fontSize: 12, color: TH.muted, marginBottom: 14 }}>
              Last synced: {new Date(qboInteg.last_sync_at).toLocaleString()}
            </div>
          )}

          {/* Sync result cards */}
          {syncResult && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Bills', data: syncResult.bills, color: TH.blue },
                { label: 'Time entries', data: syncResult.timeEntries, color: TH.green },
                { label: 'Projects', data: syncResult.projects, color: TH.amber },
              ].map(({ label, data, color }) => (
                <div key={label} style={{
                  background: color + '11', border: `1px solid ${color}33`, borderRadius: 6, padding: '10px 12px',
                }}>
                  <div style={{ fontSize: 11, color: TH.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color }}>
                    {data?.synced || 0}
                  </div>
                  {data?.errors > 0 && (
                    <div style={{ fontSize: 10, color: TH.red, marginTop: 2 }}>
                      {data.errors} error{data.errors !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={handleSyncQBO} disabled={syncing}>
              {syncing ? 'Syncing...' : 'Sync now'}
            </Btn>
            <Btn variant="ghost" onClick={disconnectQBO}>Disconnect</Btn>
          </div>
        </Card>
      )}
    </div>
  )
}
