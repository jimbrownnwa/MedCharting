import { Button } from '@/components/ui/button'
import {
  Calendar,
  Users,
  UserCog,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react'

interface HeaderProps {
  clinicName: string
}

export function Header({ clinicName }: HeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo and Clinic Name */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">MedCharting</h1>
          <span className="text-sm opacity-90">{clinicName}</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
            <HelpCircle className="h-4 w-4 mr-2" />
            Need Help?
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-sm font-medium">DO</span>
            </div>
            <span className="text-sm">Demo Owner</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1 px-4 pb-2">
        <NavButton icon={Calendar} label="Schedule" />
        <NavButton icon={Users} label="Patients" active />
        <NavButton icon={UserCog} label="Staff" />
        <NavButton icon={CreditCard} label="Billing" />
        <NavButton icon={BarChart3} label="Reports" />
        <NavButton icon={Settings} label="Settings" />
      </nav>
    </header>
  )
}

function NavButton({
  icon: Icon,
  label,
  active = false
}: {
  icon: React.ElementType
  label: string
  active?: boolean
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`
        text-primary-foreground hover:bg-primary-foreground/10
        ${active ? 'bg-primary-foreground/20' : ''}
      `}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
