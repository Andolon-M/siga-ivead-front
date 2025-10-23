"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, Radio, Clock, Calendar } from "lucide-react"

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 2

  // Auto-advance carousel every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  const schedules = [
    {
      day: "Domingos 9:00 am",
      description: "Servicio Dominical para toda la familia",
    },
    {
      day: "Miércoles 7:00 pm",
      description: "Servicio de oración",
    },
  ]

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-background.png" alt="Iglesia Vida y Esperanza" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-teal-950/90 to-green-950/95" />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-32 w-full min-h-[600px] flex items-center">
        <div className="relative overflow-hidden w-full">
          {/* Slide 1: Main Hero Content */}
          <div
            className={`transition-opacity duration-700 ease-in-out ${
              currentSlide === 0 ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="max-w-5xl mx-auto space-y-8 text-center">
              <h1
                className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight text-balance transition-all duration-700 ${
                  currentSlide === 0 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: currentSlide === 0 ? "100ms" : "0ms" }}
              >
                Hacemos discípulos para Jesús
              </h1>
              <p
                className={`text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto text-pretty transition-all duration-700 ${
                  currentSlide === 0 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: currentSlide === 0 ? "300ms" : "0ms" }}
              >
                Que sirvan a Dios en la familia, Iglesia y comunidad
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 transition-all duration-700 ${
                  currentSlide === 0 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: currentSlide === 0 ? "500ms" : "0ms" }}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Donaciones
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-live hover:bg-live/90 text-live-foreground border-live px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Radio className="mr-2 h-5 w-5 animate-pulse" />
                  En vivo
                </Button>
              </div>
            </div>
          </div>

          {/* Slide 2: Schedule Content */}
          <div
            className={`transition-opacity duration-700 ease-in-out ${
              currentSlide === 1 ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="max-w-4xl mx-auto">
              {/* Title */}
              <h2
                className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12 transition-all duration-700 ${
                  currentSlide === 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: currentSlide === 1 ? "100ms" : "0ms" }}
              >
                Nuestros Horarios
              </h2>

              {/* Schedule Cards */}
              <div className="space-y-6 mb-8">
                {schedules.map((schedule, index) => (
                  <Card
                    key={index}
                    className={`bg-white/10 backdrop-blur-md border-white/20 p-6 hover:bg-white/15 transition-all duration-700 ${
                      currentSlide === 1 ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                    }`}
                    style={{ transitionDelay: currentSlide === 1 ? `${300 + index * 150}ms` : "0ms" }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary rounded-lg">
                        <Clock className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{schedule.day}</h3>
                        <p className="text-white/90 text-lg">{schedule.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* More Schedule Button */}
              <Button
                size="lg"
                variant="outline"
                className={`bg-live hover:bg-live/90 text-live-foreground border-live px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-700 hover:scale-105 ${
                  currentSlide === 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: currentSlide === 1 ? "600ms" : "0ms" }}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Más horarios
              </Button>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === index ? "w-8 h-3 bg-white" : "w-3 h-3 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
