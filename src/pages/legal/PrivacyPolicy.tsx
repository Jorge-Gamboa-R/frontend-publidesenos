import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidad y Tratamiento de Datos Personales</h1>
      <p className="text-purple-400/60 text-sm mb-8">Última actualización: Abril 2026</p>

      <div className="space-y-8 text-purple-200/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Responsable del tratamiento</h2>
          <div className="bg-purple-950/50 border border-purple-700/30 rounded-lg p-4 text-sm space-y-1">
            <p><strong className="text-purple-200">Razón social:</strong> Publidiseños Yoyer</p>
            <p><strong className="text-purple-200">Correo electrónico:</strong> publidisenosyoyer@gmail.com</p>
            <p><strong className="text-purple-200">Teléfono:</strong> 350 236 2979</p>
            <p><strong className="text-purple-200">Domicilio:</strong> Colombia</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Marco legal</h2>
          <p>
            La presente política se rige por la <strong className="text-white">Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales),
            el <strong className="text-white">Decreto 1377 de 2013</strong> y demás normas concordantes vigentes en la República de Colombia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Datos personales que recopilamos</h2>
          <p className="mb-3">Recopilamos los siguientes datos personales cuando interactúas con nuestra tienda:</p>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li><strong className="text-purple-200">Datos de identificación:</strong> Nombre completo, correo electrónico, número de teléfono.</li>
            <li><strong className="text-purple-200">Datos de envío:</strong> Dirección, ciudad, departamento, código postal.</li>
            <li><strong className="text-purple-200">Datos de cuenta:</strong> Contraseña cifrada, historial de pedidos, lista de deseos.</li>
            <li><strong className="text-purple-200">Datos de personalización:</strong> Textos e imágenes que nos proporcionas para personalizar productos.</li>
            <li><strong className="text-purple-200">Datos de navegación:</strong> Cookies esenciales y funcionales (ver nuestra <Link to="/politica-cookies" className="text-primary-400 hover:underline">Política de Cookies</Link>).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Finalidad del tratamiento</h2>
          <p className="mb-3">Tus datos personales serán utilizados para:</p>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li>Procesar y gestionar tus pedidos y pagos.</li>
            <li>Enviar los productos adquiridos a la dirección de entrega proporcionada.</li>
            <li>Personalizar los productos según tus especificaciones (texto, imagen, color).</li>
            <li>Comunicarnos contigo sobre el estado de tus pedidos.</li>
            <li>Responder a tus consultas y mensajes de contacto.</li>
            <li>Gestionar tu cuenta de usuario y autenticación.</li>
            <li>Enviar notificaciones relacionadas con tu compra (confirmación, envío, entrega).</li>
            <li>Cumplir con obligaciones legales y contractuales.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Autorización</h2>
          <p>
            Al registrarte en nuestra plataforma, realizar una compra o enviar un formulario de contacto,
            otorgas tu autorización previa, expresa e informada para el tratamiento de tus datos personales
            conforme a las finalidades descritas en esta política, de acuerdo con el artículo 9 de la Ley 1581 de 2012.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Derechos del titular (ARCO)</h2>
          <p className="mb-3">
            Como titular de tus datos personales, tienes los siguientes derechos conforme al artículo 8 de la Ley 1581 de 2012:
          </p>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li><strong className="text-purple-200">Acceso:</strong> Conocer los datos personales que tenemos almacenados sobre ti.</li>
            <li><strong className="text-purple-200">Rectificación:</strong> Solicitar la corrección de datos inexactos, incompletos o desactualizados.</li>
            <li><strong className="text-purple-200">Cancelación:</strong> Solicitar la eliminación de tus datos cuando no sean necesarios para la finalidad para la que fueron recopilados.</li>
            <li><strong className="text-purple-200">Oposición:</strong> Oponerte al tratamiento de tus datos para finalidades específicas.</li>
            <li><strong className="text-purple-200">Revocación:</strong> Revocar la autorización otorgada para el tratamiento de tus datos.</li>
          </ul>
          <p className="mt-3 text-sm">
            Para ejercer estos derechos, envía un correo a{' '}
            <a href="mailto:publidisenosyoyer@gmail.com" className="text-primary-400 hover:underline">publidisenosyoyer@gmail.com</a>{' '}
            indicando tu nombre completo, número de identificación y el derecho que deseas ejercer.
            Responderemos en un plazo máximo de <strong className="text-white">diez (10) días hábiles</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Seguridad de los datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y administrativas para proteger tus datos personales contra
            acceso no autorizado, pérdida, alteración o destrucción. Las contraseñas se almacenan cifradas mediante
            algoritmos de hash seguros (bcrypt). Las comunicaciones entre tu navegador y nuestro servidor se realizan
            mediante protocolo HTTPS. Los pagos son procesados por Wompi (Bancolombia), una pasarela certificada PCI DSS.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Transferencia de datos</h2>
          <p>
            Tus datos personales no serán vendidos, alquilados ni compartidos con terceros para fines comerciales o publicitarios.
            Solo compartimos datos con:
          </p>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70 mt-3">
            <li><strong className="text-purple-200">Procesadores de pago:</strong> Wompi (Bancolombia), para procesar transacciones de forma segura.</li>
            <li><strong className="text-purple-200">Servicios de almacenamiento:</strong> Cloudinary, para almacenar imágenes de productos y personalizaciones.</li>
            <li><strong className="text-purple-200">Empresas de envío:</strong> Para entregar tus pedidos en la dirección proporcionada.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Conservación de datos</h2>
          <p>
            Tus datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades
            descritas en esta política y conforme a los plazos legales establecidos. Podrás solicitar la eliminación
            de tu cuenta y datos en cualquier momento, salvo aquellos que debamos conservar por obligaciones legales,
            contables o fiscales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Datos de menores de edad</h2>
          <p>
            Nuestra plataforma no está dirigida a menores de edad. No recopilamos intencionalmente datos personales
            de menores de 18 años. Si eres padre o tutor y crees que un menor nos ha proporcionado datos personales,
            contáctanos para proceder a su eliminación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">11. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar esta política en cualquier momento. Los cambios serán
            publicados en esta página con la fecha de última actualización. Te recomendamos revisarla periódicamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">12. Autoridad de protección de datos</h2>
          <p>
            Si consideras que el tratamiento de tus datos no cumple con la normativa vigente, puedes presentar
            una queja ante la <strong className="text-white">Superintendencia de Industria y Comercio (SIC)</strong>,
            autoridad de protección de datos en Colombia.
          </p>
          <p className="text-sm mt-2 text-purple-300/70">
            Sitio web: www.sic.gov.co | Línea gratuita nacional: 01 8000 910 165
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">13. Contacto</h2>
          <p>
            Para cualquier consulta sobre esta política o el tratamiento de tus datos personales:
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Correo: <a href="mailto:publidisenosyoyer@gmail.com" className="text-primary-400 hover:underline">publidisenosyoyer@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/573502362979" className="text-primary-400 hover:underline">350 236 2979</a></li>
            <li>Formulario: <Link to="/contacto" className="text-primary-400 hover:underline">Página de contacto</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
