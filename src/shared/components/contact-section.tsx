import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Mail, MessageCircle, Youtube, Facebook, Instagram, MapPin } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contactenos" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Contactenos</h2>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Map */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left">
              <div className="relative aspect-square bg-muted">
                <img
                  src="/map-location-bucaramanga-colombia.jpg"
                  alt="Ubicación"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-card rounded-lg p-4 shadow-lg border">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm">Cra 12 #14 Norte - 66 Piso 2 Kennedy,</p>
                      <p className="text-sm text-muted-foreground">Bucaramanga</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: Contact Info */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right">
              {/* Email */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <a
                      href="mailto:contactenos@ivead.org"
                      className="text-lg font-semibold hover:text-primary transition-colors"
                    >
                      contactenos@ivead.org
                    </a>
                  </div>
                </div>
              </Card>

              {/* WhatsApp */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Chat a WhatsApp</p>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">Chatear</Button>
                </div>
              </Card>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Síguenos en redes sociales</h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-14 h-14 bg-live hover:bg-live/90 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-md"
                  >
                    <Youtube className="h-7 w-7 text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-14 h-14 bg-[#1877F2] hover:bg-[#1877F2]/90 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-md"
                  >
                    <Facebook className="h-7 w-7 text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-14 h-14 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-md"
                  >
                    <Instagram className="h-7 w-7 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
