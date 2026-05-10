import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Política de Cookies</h1>

      <div className="space-y-8 text-purple-200/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web.
            Son ampliamente utilizadas para que los sitios web funcionen correctamente, así como para proporcionar
            información a los propietarios del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">¿Qué cookies utilizamos?</h2>

          <div className="space-y-4">
            <div className="bg-purple-950/50 border border-purple-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-primary-400 mb-2">Cookies esenciales</h3>
              <p className="text-sm mb-2">
                Estas cookies son necesarias para el funcionamiento básico del sitio web y no se pueden desactivar.
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-purple-300/70">
                <li><strong className="text-purple-200">Sesión de usuario</strong> — Mantiene tu sesión iniciada mientras navegas por la tienda.</li>
                <li><strong className="text-purple-200">Token de autenticación</strong> — Permite que el sitio recuerde tu inicio de sesión de forma segura.</li>
                <li><strong className="text-purple-200">Consentimiento de cookies</strong> — Recuerda tu elección sobre el uso de cookies.</li>
              </ul>
            </div>

            <div className="bg-purple-950/50 border border-purple-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-primary-400 mb-2">Cookies funcionales</h3>
              <p className="text-sm mb-2">
                Estas cookies mejoran tu experiencia de compra recordando tus preferencias.
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-purple-300/70">
                <li><strong className="text-purple-200">Carrito de compras</strong> — Guarda los productos que agregas al carrito.</li>
                <li><strong className="text-purple-200">Lista de deseos</strong> — Recuerda los productos que marcaste como favoritos.</li>
                <li><strong className="text-purple-200">Preferencias</strong> — Almacena tus preferencias de navegación.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">¿Cómo controlar las cookies?</h2>
          <p>
            Puedes configurar tu navegador para bloquear o eliminar las cookies en cualquier momento. Sin embargo,
            ten en cuenta que si desactivas las cookies esenciales, algunas funciones del sitio pueden no funcionar
            correctamente, como el inicio de sesión o el carrito de compras.
          </p>
          <p className="mt-2">
            También puedes cambiar tu preferencia de cookies en cualquier momento eliminando los datos del sitio
            en tu navegador, lo cual hará que el banner de cookies aparezca nuevamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Datos que no recopilamos</h2>
          <p>
            En Publidiseños Yoyer <strong className="text-white">no utilizamos</strong> cookies de rastreo,
            cookies publicitarias ni compartimos información con terceros con fines de marketing.
            Tu privacidad es importante para nosotros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Contacto</h2>
          <p>
            Si tienes preguntas sobre nuestra política de cookies, puedes contactarnos a través de:
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Correo: <a href="mailto:publidisenosyoyer@gmail.com" className="text-primary-400 hover:underline">publidisenosyoyer@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/573502362979" className="text-primary-400 hover:underline">350 236 2979</a></li>
            <li>O visita nuestra página de <Link to="/contacto" className="text-primary-400 hover:underline">contacto</Link></li>
          </ul>
        </section>

        <p className="text-xs text-purple-400/50 pt-4 border-t border-purple-700/30">
          Última actualización: Abril 2026
        </p>
      </div>
    </div>
  );
}
