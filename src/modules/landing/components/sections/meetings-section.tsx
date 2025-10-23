import { Youtube, Facebook, Instagram, Globe } from "lucide-react"

export function MeetingsSection() {
  const meetings = [
    { day: "Domingos 9:00 am", description: "Sercicio dominical para toda la familia" },
    { day: "Miércoles 7:00 pm", description: "Servicio de oración" },
    { day: "Jueves 8:00 am", description: "Ayuno para toda la iglesia" },
    { day: "Viernes 8:00 pm", description: "Vigilia de oración" },
    { day: "Sábados 6:00 pm", description: "Reunion Juvenil (Base 6)" },
  ]

  const socialLinks = [
    { icon: Globe, label: "IVEAD.org", href: "#" },
    { icon: Youtube, label: "Iglesia Vida y Esperanza A.D", href: "#" },
    { icon: Facebook, label: "@Vidayesperanza.AD", href: "#" },
    { icon: Instagram, label: "@ive.ad", href: "#" },
  ]

  return (
    <section id="horarios" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative leaf elements */}
      <div className="absolute top-10 left-10 w-72 h-72 opacity-5 pointer-events-none -rotate-45">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-10 right-10 w-96 h-96 opacity-5 pointer-events-none rotate-90">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Nuestras <span className="text-primary">reuniones</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Circular Image with curved border */}
            <div className="relative animate-in fade-in slide-in-from-left">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Curved green border accent */}
                <div className="absolute inset-0 rounded-full border-8 border-primary/20" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full border-8 border-primary" />

                {/* Circular image */}
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
                  <img
                    src="/images/hero-background.png"
                    alt="Reuniones de la iglesia"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                </div>
              </div>
            </div>

            {/* Right: Schedule Table */}
            <div className="animate-in fade-in slide-in-from-right">
              <div className="bg-background rounded-2xl shadow-lg p-8 border border-border">
                <div className="space-y-6">
                  {meetings.map((meeting, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-6 pb-6 border-b border-border last:border-b-0 last:pb-0 hover:translate-x-2 transition-transform duration-300"
                    >
                      <div className="flex shrink-0 w-1 h-16 bg-primary rounded-full" />
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-bold text-foreground">{meeting.day}</h3>
                        <p className="text-muted-foreground">{meeting.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{social.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
