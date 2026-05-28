import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link href="/" style={{ color: "#64748b", fontSize: 14 }} className="hover:text-white transition-colors">← Inicio</Link>

      <h1 className="text-3xl font-bold text-white mt-6 mb-2">Términos y Condiciones</h1>
      <p style={{ color: "#475569" }} className="text-sm mb-10">Última actualización: 1 de junio de 2026</p>

      <div style={{ color: "#94a3b8" }} className="space-y-8 text-sm leading-relaxed">

        <Section title="1. Aceptación de los términos">
          <p>Al acceder y usar AlphaPicks (en adelante "el Servicio"), usted acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo, no utilice el Servicio.</p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>AlphaPicks es una plataforma de análisis financiero que utiliza modelos de inteligencia artificial para seleccionar portafolios de acciones. El Servicio proporciona información basada en análisis histórico y no constituye asesoramiento de inversión personalizado.</p>
        </Section>

        <Section title="3. Aviso de riesgo financiero (importante)">
          <div style={{ background: "#1a1a2e", border: "1px solid #7c2d12", borderRadius: 10 }} className="p-4 mt-2">
            <p className="text-white font-semibold mb-2">⚠️ Lea cuidadosamente</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Los resultados mostrados provienen de <strong>backtesting histórico</strong> y no garantizan rendimientos futuros.</li>
              <li>Invertir en acciones implica riesgo de pérdida total o parcial del capital.</li>
              <li>AlphaPicks <strong>no es un asesor de inversiones</strong> autorizado por la CNBV ni por la SEC.</li>
              <li>Las estrategias publicadas son herramientas informativas, no recomendaciones de inversión.</li>
              <li>Consulte a un asesor financiero certificado antes de tomar decisiones de inversión.</li>
            </ul>
          </div>
        </Section>

        <Section title="4. Suscripción y pagos">
          <ul className="list-disc pl-5 space-y-2">
            <li>Los planes se cobran mensualmente de forma recurrente.</li>
            <li>Los precios se muestran en MXN e incluyen IVA donde aplique.</li>
            <li>Los pagos se procesan a través de Stripe de forma segura.</li>
            <li>Puede cancelar su suscripción en cualquier momento desde su perfil; el acceso continúa hasta el fin del período pagado.</li>
            <li>No se realizan reembolsos por períodos parciales.</li>
          </ul>
        </Section>

        <Section title="5. Uso aceptable">
          <p>Queda prohibido:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Redistribuir, vender o sublicenciar el contenido del Servicio.</li>
            <li>Usar el Servicio para crear un producto competidor.</li>
            <li>Realizar scraping, automatización o acceso masivo a la plataforma.</li>
            <li>Compartir credenciales de acceso con terceros.</li>
          </ul>
        </Section>

        <Section title="6. Propiedad intelectual">
          <p>Todos los contenidos, algoritmos, diseños, marcas y bases de datos son propiedad exclusiva de AlphaPicks. Queda prohibida su reproducción sin autorización escrita. Consulte la <Link href="/legal/marca" className="text-orange-400 hover:underline">Política de Marca</Link>.</p>
        </Section>

        <Section title="7. Limitación de responsabilidad">
          <p>AlphaPicks no será responsable por pérdidas financieras derivadas del uso del Servicio. La responsabilidad máxima se limita al monto pagado en los últimos 3 meses de suscripción.</p>
        </Section>

        <Section title="8. Modificaciones al servicio">
          <p>Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio con 30 días de aviso previo, excepto por causas de fuerza mayor.</p>
        </Section>

        <Section title="9. Ley aplicable">
          <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Las disputas se someterán a los tribunales competentes de Guadalajara, Jalisco.</p>
        </Section>

        <Section title="10. Contacto">
          <p>Para consultas sobre estos términos: <span className="text-orange-400">info@jupaficonsultores.com</span></p>
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
