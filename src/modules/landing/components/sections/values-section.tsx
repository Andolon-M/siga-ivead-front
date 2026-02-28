import { useState, useRef, useEffect } from "react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { ChevronLeft, ChevronRight, Fingerprint, Users, Sprout, BookOpen, Handshake, HeartHandshake } from "lucide-react"
import { cn } from "@/shared/lib/utils"

const CARD_WIDTH_PX = 320
const CARD_GAP_PX = 24
const AUTO_ADVANCE_MS = 5000

const values = [
  {
    icon: Fingerprint,
    title: "Conversion",
    description: "Conociendo a Jesús disfrutaremos de su Reino.",
  },
  {
    icon: Sprout,
    title: "Crecimiento",
    description: "Crecemos sirviendo a Dios",
  },
  {
    icon: BookOpen,
    title: "Devoción",
    description: "A mayor Devoción, mayor consagración.",
  },
  {
    icon: Handshake,
    title: "Relación",
    description: "Las buenas relaciones nos hacen sociables.",
  },
  {
    icon: Users,
    title: "Multiplicacion",
    description: "Somos llamados a multiplicarnos.",
  },
  {
    icon: HeartHandshake,
    title: "Obra Social",
    description: "Presentamos el amor de Dios a través de la Obra Social",
  },
]

export function ValuesSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)

  useEffect(() => {
    const updateTranslate = () => {
      const el = containerRef.current
      if (!el) return
      const w = el.offsetWidth
      const n = values.length
      const centerStripIndex = n + currentIndex
      const x = (w - CARD_WIDTH_PX) / 2 - centerStripIndex * (CARD_WIDTH_PX + CARD_GAP_PX)
      setTranslateX(x)
    }
    updateTranslate()
    const ro = new ResizeObserver(updateTranslate)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [currentIndex])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % values.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [])

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

          {/* Values Carousel - strip con difuminado en los lados */}
          <div ref={containerRef} className="relative overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-out will-change-transform"
              style={{ transform: `translateX(${translateX}px)` }}
            >
              {[...values, ...values, ...values].map((value, stripIndex) => {
                const n = values.length
                const centerStripIndex = n + currentIndex
                const distance = Math.abs(stripIndex - centerStripIndex)
                const isCenter = distance === 0
                const logicalIndex = stripIndex % n
                const IconComponent = value.icon
                return (
                  <div
                    key={stripIndex}
                    className={cn(
                      "shrink-0 w-[320px] transition-all duration-500 ease-out",
                      !isCenter && "cursor-pointer"
                    )}
                    style={{
                      opacity: isCenter ? 1 : 0.45,
                      filter: isCenter ? "none" : "blur(3px)",
                      transform: isCenter ? "scale(1)" : "scale(0.92)",
                    }}
                    onClick={() => !isCenter && setCurrentIndex(logicalIndex)}
                    onKeyDown={(e) =>
                      !isCenter &&
                      (e.key === "Enter" || e.key === " ") &&
                      setCurrentIndex(logicalIndex)
                    }
                    role={isCenter ? undefined : "button"}
                    tabIndex={isCenter ? -1 : 0}
                  >
                    <Card className="p-8 md:p-10 text-center h-full hover:shadow-xl transition-shadow duration-300">
                      <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center">
                          <IconComponent
                            className="h-10 w-10 md:h-12 md:w-12 text-primary"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">{value.title}</h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-3">
                        {value.description}
                      </p>
                    </Card>
                  </div>
                )
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-4 md:-translate-x-12 pointer-events-none">
              <Button
                variant="outline"
                size="icon"
                onClick={prevValue}
                className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform bg-background/95 pointer-events-auto"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-4 md:translate-x-12 pointer-events-none">
              <Button
                variant="outline"
                size="icon"
                onClick={nextValue}
                className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform bg-background/95 pointer-events-auto"
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
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir al valor ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
