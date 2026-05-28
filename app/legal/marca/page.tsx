import Link from "next/link";

export default function MarcaPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link href="/" style={{ color: "#64748b", fontSize: 14 }} className="hover:text-white transition-colors">← Inicio</Link>

      <h1 className="text-3xl font-bold text-white mt-6 mb-2">Marca y Propiedad Intelectual</h1>
      <p style={{ color: "#475569" }} className="text-sm mb-10">Última actualización: 1 de junio de 2026</p>

      <div style={{ color: "#94a3b8" }} className="space-y-8 text-sm leading-relaxed">

        <Section title="1. Titularidad de la marca">
          <p>La marca <strong className="text-white">AlphaPicks</strong>, el logotipo (símbolo α), el nombre comercial y todos los elementos visuales asociados son propiedad exclusiva de <strong className="text-white">JuPaFi Consultores</strong> / Juan Pablo Fierro Leal.</p>
          <p className="mt-2">Marca en proceso de registro ante el IMPI (Instituto Mexicano de la Propiedad Industrial).</p>
        </Section>

        <Section title="2. Propiedad del algoritmo y modelos de IA">
          <p>El modelo de inteligencia artificial de AlphaPicks, incluyendo su arquitectura, pesos de entrenamiento, metodología de selección de acciones, sistema de backtesting y lógica de rebalanceo, constituye un <strong className="text-white">secreto comercial</strong> protegido por la Ley Federal de Protección a la Propiedad Industrial (LFPPI).</p>
          <p className="mt-2">Queda expresamente prohibido:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Intentar realizar ingeniería inversa del modelo.</li>
            <li>Extraer, copiar o reproducir las estrategias de selección de acciones.</li>
            <li>Usar los resultados del modelo para entrenar sistemas competidores.</li>
          </ul>
        </Section>

        <Section title="3. Contenido de la plataforma">
          <p>Todo el contenido publicado en AlphaPicks — análisis, portafolios, gráficas, textos, interfaz de usuario y código fuente — está protegido por derechos de autor.</p>
          <p className="mt-2">Se permite:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Uso personal para gestionar sus inversiones.</li>
            <li>Captura de pantalla para uso personal no comercial.</li>
          </ul>
          <p className="mt-2">Queda prohibido:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Reproducir las estrategias en blogs, newsletters o redes sociales con fines comerciales.</li>
            <li>Crear servicios derivados basados en los portafolios publicados.</li>
            <li>Redistribuir los análisis sin autorización escrita.</li>
          </ul>
        </Section>

        <Section title="4. Datos financieros de terceros">
          <p>Los datos de mercado utilizados por AlphaPicks son licenciados de proveedores autorizados (Financial Modeling Prep, BMV). Su reproducción fuera de la plataforma viola los acuerdos de licencia correspondientes.</p>
        </Section>

        <Section title="5. Uso de la marca AlphaPicks">
          <p>Para solicitar permiso de uso de la marca (prensa, alianzas, integraciones), contacte: <span className="text-orange-400">info@jupaficonsultores.com</span> con asunto "Licencia de Marca".</p>
          <p className="mt-2">No se autoriza el uso de la marca AlphaPicks en materiales que:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Promuevan asesoramiento financiero no autorizado.</li>
            <li>Asocien la marca con rendimientos garantizados.</li>
            <li>Creen confusión con productos competidores.</li>
          </ul>
        </Section>

        <Section title="6. Notificación de infracciones">
          <p>Si detecta un uso no autorizado de la marca AlphaPicks o de sus contenidos, repórtelo a <span className="text-orange-400">info@jupaficonsultores.com</span> con asunto "Infracción IP". Actuaremos en un plazo de 72 horas hábiles.</p>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3" style={{ borderBottom: "1px solid #1e2d45", paddingBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}
