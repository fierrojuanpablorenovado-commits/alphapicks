/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function DatosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link href="/" style={{ color: "#64748b", fontSize: 14 }} className="hover:text-white transition-colors">← Inicio</Link>

      <h1 className="text-3xl font-bold text-white mt-6 mb-2">Datos y Cumplimiento</h1>
      <p style={{ color: "#475569" }} className="text-sm mb-10">Última actualización: 1 de junio de 2026</p>

      <div style={{ color: "#94a3b8" }} className="space-y-8 text-sm leading-relaxed">

        <Section title="1. Seguridad de la base de datos">
          <p className="mb-3">AlphaPicks implementa las siguientes medidas de seguridad en su base de datos (Neon PostgreSQL):</p>
          <div className="space-y-3">
            <Item icon="🔒" title="Row Level Security (RLS)">
              Cada usuario solo puede leer y modificar sus propios datos. Las políticas RLS están activas en todas las tablas con datos de usuario.
            </Item>
            <Item icon="🔐" title="Cifrado en reposo">
              Todos los datos se almacenan cifrados con AES-256. Las contraseñas se almacenan como hashes bcrypt (factor 12).
            </Item>
            <Item icon="🌐" title="Cifrado en tránsito">
              Toda comunicación usa TLS 1.3. HSTS habilitado con preload.
            </Item>
            <Item icon="🛡️" title="Variables de entorno">
              Las credenciales de base de datos y claves API nunca se exponen al cliente. Se gestionan como variables de entorno de servidor en Vercel.
            </Item>
          </div>
        </Section>

        <Section title="2. CORS — Control de acceso por origen">
          <p className="mb-3">Las API routes de AlphaPicks solo aceptan solicitudes del dominio oficial:</p>
          <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8 }} className="p-3 font-mono text-xs text-green-400">
            Access-Control-Allow-Origin: https://alphapicks.vercel.app
          </div>
          <p className="mt-3">Solicitudes desde dominios no autorizados son rechazadas automáticamente con código 403.</p>
        </Section>

        <Section title="3. Security Headers">
          <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8 }} className="p-4 font-mono text-xs space-y-1.5">
            {[
              ["X-Frame-Options", "SAMEORIGIN"],
              ["X-Content-Type-Options", "nosniff"],
              ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
              ["Referrer-Policy", "strict-origin-when-cross-origin"],
              ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
              ["Content-Security-Policy", "default-src 'self'"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <span className="text-orange-400 shrink-0">{k}:</span>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="4. Proveedores de datos financieros">
          <p className="mb-3">Los datos de acciones y fundamentales provienen de:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">Financial Modeling Prep (FMP)</strong> — datos fundamentales, precios históricos, estados financieros. Licenciados para uso comercial.</li>
            <li><strong className="text-white">Bolsa Mexicana de Valores (BMV)</strong> — datos de precios en tiempo real vía proveedor autorizado.</li>
          </ul>
          <p className="mt-3">Los datos de backtesting abarcan 25+ años de historia y son actualizados mensualmente.</p>
        </Section>

        <Section title="5. Retención y eliminación">
          <table className="w-full text-xs mt-2">
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2d45", color: "#64748b" }}>
                <th className="text-left py-2">Tipo de dato</th>
                <th className="text-left py-2">Retención</th>
                <th className="text-left py-2">Eliminación</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {[
                ["Datos de cuenta", "Mientras activa + 2 años", "Solicitud o baja"],
                ["Logs de acceso", "90 días", "Automática"],
                ["Datos de pago", "7 años (Stripe)", "No aplica (Stripe)"],
                ["Historial de estrategias", "Mientras activa", "Solicitud o baja"],
              ].map(([tipo, ret, eli]) => (
                <tr key={tipo} style={{ borderBottom: "1px solid #1e2d4533" }}>
                  <td className="py-2 text-white">{tipo}</td>
                  <td className="py-2">{ret}</td>
                  <td className="py-2">{eli}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="6. Cumplimiento normativo">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">LFPDPPP</strong> — Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</li>
            <li><strong className="text-white">GDPR</strong> — Para usuarios en la Unión Europea, aplicamos las salvaguardias del RGPD.</li>
            <li><strong className="text-white">PCI-DSS</strong> — Cumplimiento via Stripe; AlphaPicks no almacena datos de tarjetas.</li>
          </ul>
        </Section>

        <Section title="7. Reporte de vulnerabilidades">
          <p>Si descubre una vulnerabilidad de seguridad, repórtela responsablemente a <span className="text-orange-400">info@jupaficonsultores.com</span> con asunto "Security Report". No divulgue públicamente hasta recibir confirmación de resolución.</p>
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

function Item({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8 }} className="p-3">
      <p className="text-white font-semibold text-xs mb-1">{icon} {title}</p>
      <p>{children}</p>
    </div>
  );
}
