import { Card } from "@/shared/components/ui/card"

export function AboutSection() {
  return (
    <section id="quienes-somos" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative leaf elements */}
      <div className="absolute top-20 right-0 w-96 h-96 opacity-5 dark:opacity-10 pointer-events-none">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-20 left-0 w-80 h-80 opacity-5 dark:opacity-10 pointer-events-none rotate-180">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Sobre <span className="text-primary">nosotros</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Quienes Somos */}
              <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left">
                <div className="flex items-start gap-4 mb-4">
                  <img src="/ad-logo.jpg" alt="AD Logo" className="w-20 h-20 object-contain" />
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Quienes somos</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Somos una iglesia del Concilio de las Asambleas de Dios de Colombia
                    </p>
                  </div>
                </div>
              </Card>

              {/* Nuestra Misión */}
              <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left delay-100">
                <h3 className="text-2xl font-bold mb-4">
                  Nuestra <span className="text-primary">Misión</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  somo una iglesia que proclama y enseña la palabra de Dios, practica el servicio, cultiva la comunión e
                  inspira a sus miembros a la adoración.
                </p>
              </Card>

              {/* Nuestra Visión */}
              <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left delay-200">
                <h3 className="text-2xl font-bold mb-4">
                  Nuestra <span className="text-primary">Visión</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hacemos discípulos para Jesús que sirvan a Dios en la familia, iglesia y comunidad.
                </p>
              </Card>
            </div>

            {/* Right Column - Historia */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right">
              <h3 className="text-2xl font-bold mb-4">
                Nuestra <span className="text-primary">Historia</span>
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  La Iglesia Vida y Esperanza de las Asambleas de Dios de Colombia, Fue establecida en el año 2005 por
                  los ministros ómar Bohórquez y David Leiton, en aquel entonces ambos pertenecientes al concilio
                  Asambleas de Dios. Inicialmente fue conocida como la Carpa de la Esperanza, pues la iglesia fue
                  fundada como una extensión del Centro Cristiano la Esperanza.
                </p>
                <p>
                  En 2010, siguiendo las directrices del concilio, la iglesia se desvinculó del Centro Cristiano la
                  Esperanza y pasó a estar directamente bajo la cobertura del Concilio de las Asambleas de Dios de
                  Colombia, adoptando el nombre de Iglesia Vida y Esperanza de las Asambleas de Dios de Colombia. En ese
                  momento, el ministro a cargo fue Martín Méndez Martínez, actualmente ministro ordenado de las
                  Asambleas de Dios, quien actualmente permanece en el cargo.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
