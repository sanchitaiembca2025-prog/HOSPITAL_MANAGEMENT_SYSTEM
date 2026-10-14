import { Patient } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface PatientCardProps {
  patient: Patient
  actions?: React.ReactNode
}

export function PatientCard({ patient, actions }: PatientCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                P-{patient.patientId}
              </span>
              <h3 className="text-lg font-semibold text-neutral-800">
                {patient.firstName} {patient.lastName}
              </h3>
              <span className="text-sm text-neutral-600">
                {patient.age}y, {patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Phone className="h-3.5 w-3.5" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <MapPin className="h-3.5 w-3.5" />
                <span>{patient.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Calendar className="h-3.5 w-3.5" />
                <span>Registered {formatDate(patient.registeredAt)}</span>
              </div>
            </div>
          </div>
          {actions && <div className="ml-4 shrink-0">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
