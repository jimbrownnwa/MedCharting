import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { PatientSidebar } from '@/components/PatientSidebar'
import { PatientInfo } from '@/components/sections/PatientInfo'
import { PrimaryComplaint } from '@/components/sections/PrimaryComplaint'
import { BodyChart } from '@/components/sections/BodyChart'
import { FileUpload } from '@/components/sections/FileUpload'
import { Button } from '@/components/ui/button'
import { Lock, Eye, Settings, Plus } from 'lucide-react'
import type { Patient, ChartEntry } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Live data comes from Supabase

function App() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientData, setPatientData] = useState<Partial<Patient>>({})
  const [primaryComplaint, setPrimaryComplaint] = useState('')
  const [chartStatus] = useState<'draft' | 'signed'>('draft')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<ChartEntry | null>(null)

  // Load patients on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Failed to fetch patients:', error)
      } else {
        setPatients(data as Patient[])
        if (data && data.length > 0) {
          setSelectedPatient(data[0] as Patient)
          setPatientData(data[0] as Patient)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAddPatient = () => {
    // Create a local-only draft. Save occurs only when user clicks Save Patient.
    const draft: Partial<Patient> = {
      name: '',
      date_of_birth: '',
      age: 0,
      gender: ''
    }
    setIsNewPatient(true)
    setPatientData(draft)
    // Use a placeholder selection to render the editor area
    setSelectedPatient({
      id: '',
      name: '',
      date_of_birth: '',
      age: 0,
      gender: '',
      created_at: new Date().toISOString()
    } as Patient)
  }

  const handlePatientUpdate = (data: Partial<Patient>) => {
    setPatientData(data)
  }

  const savePatientInfo = async () => {
    if (!selectedPatient) return
    setSaving(true)
    const payload = {
      name: patientData.name,
      date_of_birth: patientData.date_of_birth,
      age: patientData.age,
      gender: patientData.gender,
      email: patientData.email,
      phone: patientData.phone,
      address: patientData.address
    }
    let updated: Patient | null = null
    if (isNewPatient || !selectedPatient.id) {
      // Insert new patient
      const { data, error } = await supabase
        .from('patients')
        .insert(payload)
        .select()
        .single()
      if (error) {
        console.error('Failed to create patient:', error)
        alert('Failed to create patient')
        setSaving(false)
        return
      }
      updated = data as Patient
      setPatients((prev) => [updated!, ...prev])
      setIsNewPatient(false)
    } else {
      // Update existing
      const { data, error } = await supabase
        .from('patients')
        .update(payload)
        .eq('id', selectedPatient.id)
        .select()
        .single()
      if (error) {
        console.error('Failed to save patient info:', error)
        alert('Failed to save patient info')
        setSaving(false)
        return
      }
      updated = data as Patient
      setPatients((prev) => prev.map((p) => (p.id === updated!.id ? updated! : p)))
    }
    setSelectedPatient(updated!)
    setPatientData(updated!)
    setSaving(false)
  }

  const handleBodyChartSave = async (drawingData: string) => {
    if (!selectedPatient) {
      alert('Select a patient first')
      return
    }
    // Ensure a draft chart entry exists for this patient
    const entry = await getOrCreateDraftEntry(selectedPatient.id)
    if (!entry) return
    const { error: drawErr } = await supabase
      .from('body_chart_drawings')
      .insert({ chart_entry_id: entry.id, drawing_data: drawingData })
    if (drawErr) {
      console.error('Failed to save drawing:', drawErr)
      alert('Failed to save body chart (drawing)')
      return
    }
    alert('Body chart saved')
  }

  // Find existing draft chart entry or create one
  const getOrCreateDraftEntry = async (patientId: string): Promise<ChartEntry | null> => {
    const { data: existing, error: findErr } = await supabase
      .from('chart_entries')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (findErr && findErr.code !== 'PGRST116') {
      // PGRST116 -> no rows
      console.error('Failed to find draft entry:', findErr)
      alert('Failed to load chart entry')
      return null
    }
    if (existing) {
      setCurrentEntry(existing as ChartEntry)
      return existing as ChartEntry
    }
    const { data: created, error: createErr } = await supabase
      .from('chart_entries')
      .insert({ patient_id: patientId, primary_complaint, status: 'draft', owner: 'Demo User' })
      .select()
      .single()
    if (createErr || !created) {
      console.error('Failed to create chart entry:', createErr)
      alert('Failed to create chart entry')
      return null
    }
    setCurrentEntry(created as ChartEntry)
    return created as ChartEntry
  }

  const savePrimaryComplaint = async () => {
    if (!selectedPatient) {
      alert('Select a patient first')
      return
    }
    setSaving(true)
    const entry = await getOrCreateDraftEntry(selectedPatient.id)
    if (!entry) {
      setSaving(false)
      return
    }
    const { data, error } = await supabase
      .from('chart_entries')
      .update({ primary_complaint: primaryComplaint })
      .eq('id', entry.id)
      .select()
      .single()
    if (error) {
      console.error('Failed to save primary complaint:', error)
      alert('Failed to save primary complaint')
    } else {
      setCurrentEntry(data as ChartEntry)
    }
    setSaving(false)
  }

  const handleFileUpload = (files: Array<{ file: File; preview: string; description: string }>) => {
    console.log('Files uploaded:', files)
  }

  const handleSign = () => {
    console.log('Chart signed')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header clinicName="Demo Clinic" />

      <div className="flex-1 flex overflow-hidden">
        <PatientSidebar
          patients={patients}
          selectedPatient={selectedPatient}
          onSelectPatient={(patient) => {
            setIsNewPatient(false)
            setSelectedPatient(patient)
            setPatientData(patient)
          }}
          onAddPatient={handleAddPatient}
        />

        <main className="flex-1 overflow-y-auto">
          {selectedPatient ? (
            <div className="p-6 pb-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Profile</span>
                    <span>Edit</span>
                    <span className="text-primary font-medium">Chart</span>
                    <span>Appointments</span>
                    <span>Billing</span>
                    <span>Communications</span>
                    <span>Files</span>
                  </div>
                </div>
                <Button className="bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>

              <div className="space-y-6">
                <PatientInfo
                  patient={patientData}
                  onUpdate={handlePatientUpdate}
                />
                <div className="flex justify-end -mt-4">
                  <Button variant="outline" size="sm" onClick={savePatientInfo} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Patient'}
                  </Button>
                </div>

                <PrimaryComplaint
                  value={primaryComplaint}
                  onChange={setPrimaryComplaint}
                  status={chartStatus}
                  owner="Demo Owner"
                />
                <div className="flex justify-end -mt-4">
                  <Button variant="outline" size="sm" onClick={savePrimaryComplaint} disabled={saving || !primaryComplaint.trim()}>
                    {saving ? 'Saving...' : 'Save Primary Complaint'}
                  </Button>
                </div>

                <BodyChart
                  onSave={handleBodyChartSave}
                />

                <FileUpload
                  onUpload={handleFileUpload}
                />
              </div>

              <div className="fixed bottom-0 left-64 right-0 bg-white border-t px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>Not Visible To Patient</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Viewable by Everyone</span>
                  <Button variant="outline">Close</Button>
                  <Button onClick={handleSign}>
                    <Lock className="h-4 w-4 mr-2" />
                    Sign
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a patient to view their chart</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
