import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface PrimaryComplaintProps {
  value: string
  onChange: (value: string) => void
  status: 'draft' | 'signed'
  owner: string
}

export function PrimaryComplaint({ value, onChange, status, owner }: PrimaryComplaintProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Primary Complaint</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'draft' ? 'secondary' : 'default'}>
            {status === 'draft' ? 'Draft' : 'Signed'}
          </Badge>
          <span className="text-sm text-muted-foreground">{owner}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter the patient's primary complaint..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] resize-none"
        />
      </CardContent>
    </Card>
  )
}
