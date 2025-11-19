import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Patient } from '@/lib/supabase'

interface PatientSidebarProps {
  patients: Patient[]
  selectedPatient: Patient | null
  onSelectPatient: (patient: Patient) => void
  onAddPatient: () => void
}

export function PatientSidebar({
  patients,
  selectedPatient,
  onSelectPatient,
  onAddPatient
}: PatientSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Patient Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPatients.map((patient) => (
          <button
            key={patient.id}
            onClick={() => onSelectPatient(patient)}
            className={cn(
              "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted transition-colors",
              selectedPatient?.id === patient.id && "bg-primary/10 border-l-2 border-primary"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium truncate">{patient.name}</span>
          </button>
        ))}

        {filteredPatients.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No patients found
          </div>
        )}
      </div>

      {/* Add Patient Button */}
      <div className="p-3 border-t">
        <Button onClick={onAddPatient} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>
    </div>
  )
}
