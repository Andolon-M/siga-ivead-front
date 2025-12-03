import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Switch } from "@/shared/components/ui/switch"
import { Textarea } from "@/shared/components/ui/textarea"
import { Settings, Bell, Lock, Palette } from "lucide-react"

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración del sistema</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Iglesia</CardTitle>
              <CardDescription>Configura la información básica de la iglesia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="church-name">Nombre de la Iglesia</Label>
                <Input id="church-name" defaultValue="Iglesia Vida y Esperanza" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-address">Dirección</Label>
                <Input id="church-address" defaultValue="Cra 12 # 14 Norte - 66 Piso 2 Kennedy, Bucaramanga" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="church-phone">Teléfono</Label>
                  <Input id="church-phone" defaultValue="+57 300 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="church-email">Email</Label>
                  <Input id="church-email" type="email" defaultValue="contactenos@ivead.org" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-description">Descripción</Label>
                <Textarea
                  id="church-description"
                  rows={4}
                  defaultValue="Hacemos discípulos para Jesús que sirvan a Dios en la familia, iglesia y comunidad."
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Configura los enlaces a redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input id="youtube" placeholder="https://youtube.com/..." />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Configura cómo deseas recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">Recibe notificaciones en tiempo real</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">Recibe resúmenes por correo electrónico</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-email">Email para Notificaciones</Label>
                <Input id="notification-email" type="email" defaultValue="admin@ivead.org" />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>Configura las opciones de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de Dos Factores</Label>
                  <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Cambiar Contraseña</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">Actualizar Contraseña</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalización</CardTitle>
              <CardDescription>Personaliza la apariencia del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Color Principal</Label>
                <div className="flex gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary border-2 border-foreground cursor-pointer" />
                  <div className="h-10 w-10 rounded-full bg-blue-500 cursor-pointer" />
                  <div className="h-10 w-10 rounded-full bg-purple-500 cursor-pointer" />
                  <div className="h-10 w-10 rounded-full bg-red-500 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la Iglesia</Label>
                <Input id="logo" type="file" accept="image/*" />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

