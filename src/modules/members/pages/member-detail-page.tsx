import { useParams, useNavigate } from "react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Users,
    Church,
    UserCog,
    CalendarCheck,
    Loader2,
    Edit,
    AlertCircle
} from "lucide-react"
import { useMember } from "../hooks/use-member"
import { useState } from "react"
import { EditMemberDialog } from "../components/edit-member-dialog"
import { membersService } from "../services/members.service"
import type { UpdateMemberData } from "../types"
import { formatDateLong, calculateAge } from "@/shared/lib/date-utils"

export function MemberDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { member, loading, error, refetch } = useMember(id)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpdateMember = async (data: UpdateMemberData) => {
        if (!member) return

        try {
            setIsSubmitting(true)
            await membersService.updateMember(member.id, data)
            setIsEditModalOpen(false)
            await refetch()
        } catch (error) {
            console.error("Error al actualizar miembro:", error)
        } finally {
            setIsSubmitting(false)
        }
    }


    const statusColors = {
        ACTIVO: "default",
        ASISTENTE: "secondary",
        INACTIVO: "destructive",
        VISITANTE: "outline",
    } as const

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !member) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Error</h1>
                    </div>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        <p className="text-lg font-semibold mb-2">No se pudo cargar el miembro</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error?.message || "Miembro no encontrado"}
                        </p>
                        <Button onClick={() => navigate("/admin/members")}>
                            Volver a Miembros
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">
                            {member.name} {member.last_name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Detalles del miembro
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card Principal */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Datos básicos del miembro</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                                    <p className="text-base font-semibold">
                                        {member.name} {member.last_name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Documento</p>
                                    <p className="text-base font-semibold">
                                        {member.tipo_dni}: {member.dni_user}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
                                    <p className="text-base font-semibold">
                                        {formatDateLong(member.birthdate)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {calculateAge(member.birthdate)} años
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Género</p>
                                    <p className="text-base font-semibold">{member.gender}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                    <p className="text-base font-semibold">{member.cell}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                                    <p className="text-base font-semibold">{member.direccion}</p>
                                </div>
                            </div>

                            {member.user_email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-base font-semibold break-all">{member.user_email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                    <Badge variant={statusColors[member.status] as any} className="mt-1">
                                        {member.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Estadísticas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Estadísticas</CardTitle>
                        <CardDescription>Resumen de actividades</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <Church className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Ministerios</span>
                            </div>
                            <span className="text-2xl font-bold">{member.total_ministries || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <UserCog className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Liderazgo</span>
                            </div>
                            <span className="text-2xl font-bold">{member.leadership_count || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Equipos</span>
                            </div>
                            <span className="text-2xl font-bold">{member.team_count || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Eventos</span>
                            </div>
                            <span className="text-2xl font-bold">{member.total_events_attended || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Información del Sistema */}
            <Card>
                <CardHeader>
                    <CardTitle>Información del Sistema</CardTitle>
                    <CardDescription>Fechas de registro y actualización</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de Registro</p>
                            <p className="text-base font-semibold">{formatDateLong(member.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Última Actualización</p>
                            <p className="text-base font-semibold">{formatDateLong(member.updated_at)}</p>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Modal de Edición */}
            <EditMemberDialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                member={member}
                onSubmit={handleUpdateMember}
            />
        </div>
    )
}

