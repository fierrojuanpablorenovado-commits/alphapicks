import Link from "next/link";

const LAST_UPDATE = "1 de junio de 2026";

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link href="/" style={{ color: "#64748b", fontSize: 14 }} className="hover:text-white transition-colors">← Inicio</Link>

      <h1 className="text-3xl font-bold text-white mt-6 mb-2">Política de Privacidad</h1>
      <p style={{ color: "#475569" }} className="text-sm mb-10">Última actualización: {LAST_UPDATE}</p>

      <div style={{ color: "#94a3b8" }} className="space-y-8 text-sm leading-relaxed">

        <Section title="1. Responsable del tratamiento">
          <p><strong className="text-white">AlphaPicks</strong> es el responsable del tratamiento de los datos personales que usted nos proporcione a través de este sitio web (alphapicks.vercel.app) y sus servicios asociados.</p>
          <p className="mt-2">Contacto: <span className="text-orange-400">info@jupaficonsultores.com</span></p>
        </Section>

        <Section title="2. Datos que recopilamos">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">Datos de registro:</strong> nombre, correo electrónico, contraseña (hasheada).</li>
            <li><strong className="text-white">Datos de uso:</strong> estrategias consultadas, páginas visitadas, sesiones.</li>
            <li><strong className="text-white">Datos de pago:</strong> procesados exclusivamente por Stripe; AlphaPicks no almacena datos de tarjetas.</li>
            <li><strong className="text-white">Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo (solo para seguridad y análisis).</li>
          </ul>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <ul className="list-disc pl-5 space-y-2">
            <li>Proveer el servicio de selección de acciones con IA.</li>
            <li>Gestionar su suscripción y facturación.</li>
            <li>Enviar notificaciones de rebalanceo mensual (puede desactivarlas).</li>
            <li>Mejorar el servicio mediante análisis de uso agregado y anónimo.</li>
            <li>Cumplir con obligaciones legales aplicables.</li>
          </ul>
        </Section>

        <Section title="4. Base legal">
          <p>El tratamiento se basa en: (a) la ejecución del contrato de suscripción, (b) su consentimiento explícito para comunicaciones de marketing, y (c) el interés legítimo para mejorar la seguridad y el servicio.</p>
        </Section>

        <Section title="5. Retención de datos">
          <p>Los datos de cuenta se conservan mientras la suscripción esté activa y por 2 años adicionales por razones legales. Puede solicitar la eliminación en cualquier momento.</p>
        </Section>

        <Section title="6. Compartición de datos">
          <p>No vendemos ni compartimos sus datos con terceros, excepto:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong className="text-white">Stripe</strong> — procesamiento de pagos.</li>
            <li><strong className="text-white">Vercel / Neon</strong> — infraestructura de hosting y base de datos, bajo contratos de procesamiento de datos.</li>
            <li>Autoridades competentes cuando exista obligación legal.</li>
          </ul>
        </Section>

        <Section title="7. Sus derechos">
          <p>Puede ejercer en cualquier momento sus derechos de acceso, rectificación, cancelación, oposición, portabilidad y olvido enviando un correo a <span className="text-orange-400">info@jupaficonsultores.com</span> con asunto "Derechos ARCO".</p>
        </Section>

        <Section title="8. Cookies">
          <p>Utilizamos cookies estrictamente necesarias para el funcionamiento del servicio. No utilizamos cookies de rastreo publicitario de terceros.</p>
        </Section>

        <Section title="9. Seguridad">
          <p>Implementamos medidas técnicas y organizativas: cifrado TLS en tránsito, datos en reposo cifrados, autenticación de dos factores, Row Level Security en base de datos, y revisiones periódicas de seguridad.</p>
        </Section>

        <Section title="10. Cambios a esta política">
          <p>Notificaremos cambios materiales por correo con al menos 15 días de anticipación.</p>
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
