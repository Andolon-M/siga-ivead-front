import { useState } from "react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { ChevronLeft, ChevronRight, Heart, Users, Sprout, BookOpen, Handshake, Crown } from "lucide-react"

export function ValuesSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const values = [
    {
      icon: Heart,
      title: "Conversion",
      description: "Hacemos discípulos para Jesús que sirvan a Dios en la familia, iglesia y comunidad.",
    },
    {
      icon: Users,
      title: "Comunidad social",
      description: "Cultivamos relaciones significativas y servimos juntos como familia de fe.",
    },
    {
      icon: Sprout,
      title: "Crecimiento",
      description: "Fomentamos el desarrollo espiritual continuo de cada miembro.",
    },
    {
      icon: BookOpen,
      title: "Palabra",
      description: "Proclamamos y enseñamos la palabra de Dios con fidelidad.",
    },
    {
      icon: Handshake,
      title: "Servicio",
      description: "Practicamos el servicio activo en nuestra comunidad.",
    },
    {
      icon: Crown,
      title: "Adoración",
      description: "Inspiramos a nuestros miembros a la adoración genuina.",
    },
  ]

  const nextValue = () => {
    setCurrentIndex((prev) => (prev + 1) % values.length)
  }

  const prevValue = () => {
    setCurrentIndex((prev) => (prev - 1 + values.length) % values.length)
  }

  return (
    <section id="valores" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative leaf elements */}
      <div className="absolute top-1/4 right-0 w-80 h-80 opacity-5 pointer-events-none rotate-12">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 opacity-5 pointer-events-none -rotate-12">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Nuestros <span className="text-primary">valores</span>
          </h2>

          {/* Values Carousel */}
          <div className="relative">
            <Card className="p-12 text-center hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-center mb-8">
                {(() => {
                  const IconComponent = values[currentIndex].icon
                  return (
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="h-12 w-12 text-primary" strokeWidth={1.5} />
                    </div>
                  )
                })()}
              </div>
              <h3 className="text-3xl font-bold mb-4">{values[currentIndex].title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {values[currentIndex].description}
              </p>
            </Card>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-4 md:-translate-x-12">
              <Button
                variant="outline"
                size="icon"
                onClick={prevValue}
                className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform bg-transparent"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-4 md:translate-x-12">
              <Button
                variant="outline"
                size="icon"
                onClick={nextValue}
                className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform bg-transparent"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {values.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
