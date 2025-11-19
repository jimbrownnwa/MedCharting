import { useState } from 'react'
import { Header } from '@/components/Header'
import { PatientSidebar } from '@/components/PatientSidebar'
import { PatientInfo } from '@/components/sections/PatientInfo'
import { PrimaryComplaint } from '@/components/sections/PrimaryComplaint'
import { BodyChart } from '@/components/sections/BodyChart'
import { FileUpload } from '@/components/sections/FileUpload'
import { Button } from '@/components/ui/button'
import { Lock, Eye, Settings, Plus } from 'lucide-react'
import type { Patient } from '@/lib/supabase'

const samplePatients: Patient[] = [
  {
    id: '1',
    name: 'Leanne Abraham',
    date_of_birth: '1985-03-15',
    age: 39,
    gender: 'female',
    email: 'leanne@email.com',
    phone: '(555) 123-4567',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Anthony Addy',
    date_of_birth: '1990-07-22',
    age: 34,
    gender: 'male',
    email: 'anthony@email.com',
    phone: '(555) 234-5678',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Ryan Anderson',
    date_of_birth: '1988-11-08',
    age: 36,
    gender: 'male',
    email: 'ryan@email.com',
    phone: '(555) 345-6789',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Sarah Belanger',
    date_of_birth: '1992-01-30',
    age: 32,
    gender: 'female',
    email: 'sarah@email.com',
    phone: '(555) 456-7890',
    created_at: new Date().toISOString()
  }
]

function App() {
  const [patients] = useState<Patient[]>(samplePatients)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(samplePatients[2])
  const [patientData, setPatientData] = useState<Partial<Patient>>(samplePatients[2])
  const [primaryComplaint, setPrimaryComplaint] = useState('')
  const [chartStatus] = useState<'draft' | 'signed'>('draft')

  const handleAddPatient = () => {
    console.log('Add patient clicked')
  }

  const handlePatientUpdate = (data: Partial<Patient>) => {
    setPatientData(data)
    console.log('Patient updated:', data)
  }

  const handleBodyChartSave = (drawingData: string) => {
    console.log('Body chart saved:', drawingData.substring(0, 100) + '...')
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

                <PrimaryComplaint
                  value={primaryComplaint}
                  onChange={setPrimaryComplaint}
                  status={chartStatus}
                  owner="Demo Owner"
                />

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
