import { Link } from 'react-router-dom';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Términos y Condiciones</h1>
      <p className="text-purple-400/60 text-sm mb-8">Última actualización: Abril 2026</p>

      <div className="space-y-8 text-purple-200/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Información general</h2>
          <p>
            Los presentes Términos y Condiciones regulan el uso del sitio web y la tienda en línea de
            <strong className="text-white"> Publidiseños Yoyer</strong>, dedicada a la venta de productos
            personalizados y de publicidad. Al acceder, navegar o realizar una compra en nuestro sitio,
            aceptas estos términos en su totalidad.
          </p>
          <p className="mt-2">
            Estos términos se rigen por la legislación colombiana, en particular por la
            <strong className="text-white"> Ley 1480 de 2011</strong> (Estatuto del Consumidor) y el
            <strong className="text-white"> Decreto 1074 de 2015</strong> (comercio electrónico).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Productos y personalización</h2>
          <p className="mb-3">
            Publidiseños Yoyer ofrece productos con opción de personalización. Al realizar un pedido personalizado, el cliente debe tener en cuenta:
          </p>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li>Las imágenes de los productos en el sitio son referenciales. Pueden existir variaciones menores de color debido a la configuración de cada pantalla.</li>
            <li>El cliente es responsable del contenido (textos e imágenes) proporcionado para la personalización.</li>
            <li>No se aceptan contenidos que infrinjan derechos de autor, marcas registradas, o que contengan material ilegal, ofensivo o difamatorio.</li>
            <li>Publidiseños Yoyer se reserva el derecho de rechazar personalizaciones que considere inapropiadas.</li>
            <li>Los productos personalizados se fabrican bajo pedido y pueden tener tiempos de entrega mayores.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Precios y pagos</h2>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li>Todos los precios están expresados en <strong className="text-purple-200">Pesos Colombianos (COP)</strong> e incluyen IVA cuando corresponda.</li>
            <li>Los precios pueden cambiar sin previo aviso, pero los cambios no afectarán pedidos ya confirmados.</li>
            <li>Aceptamos pagos con tarjeta de crédito, tarjeta débito y otros medios habilitados en nuestra plataforma.</li>
            <li>Los pagos son procesados de forma segura a través de Wompi (Bancolombia), pasarela certificada PCI DSS. Se aceptan tarjetas, PSE, Nequi y Bancolombia Transfer.</li>
            <li>Publidiseños Yoyer no almacena datos de tarjetas de crédito o débito.</li>
            <li>La compra se perfecciona una vez confirmado el pago y enviada la confirmación al correo del cliente.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Proceso de compra</h2>
          <ol className="space-y-2 text-sm list-decimal list-inside text-purple-300/70">
            <li>El cliente selecciona los productos y personaliza según las opciones disponibles.</li>
            <li>Agrega los productos al carrito de compras.</li>
            <li>Ingresa o confirma la dirección de envío.</li>
            <li>Selecciona el método de pago y completa la transacción.</li>
            <li>Recibe un correo de confirmación con el número de pedido.</li>
            <li>El pedido entra en producción y el cliente puede hacer seguimiento desde su cuenta.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Envíos y entregas</h2>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li>Realizamos envíos a todo el territorio colombiano.</li>
            <li>Los tiempos de entrega varían según la ubicación y el tipo de producto (estándar o personalizado).</li>
            <li>Los costos de envío se calculan según la dirección de destino y se muestran antes de confirmar el pago.</li>
            <li>Los tiempos de entrega son estimados y pueden variar por factores externos (clima, transportadora, días festivos).</li>
            <li>Es responsabilidad del cliente proporcionar una dirección de envío correcta y completa.</li>
            <li>Si no hay quien reciba el pedido en el momento de la entrega, la transportadora intentará una nueva entrega o se comunicará con el destinatario.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Derecho de retracto</h2>
          <p>
            De acuerdo con el <strong className="text-white">artículo 47 de la Ley 1480 de 2011</strong>, el consumidor
            tiene derecho a retractarse de la compra dentro de los <strong className="text-white">cinco (5) días hábiles</strong> siguientes
            a la entrega del producto, siempre que:
          </p>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70 mt-3">
            <li>El producto se encuentre en su empaque original, sin uso y en perfecto estado.</li>
            <li>Se conserven todas las etiquetas y accesorios.</li>
          </ul>
          <div className="mt-3 bg-secondary-500/10 border border-secondary-500/30 rounded-lg p-4 text-sm">
            <p className="text-secondary-400 font-medium">Excepción para productos personalizados:</p>
            <p className="mt-1 text-purple-300/70">
              Conforme al artículo 47, parágrafo de la Ley 1480 de 2011, el derecho de retracto
              <strong className="text-purple-200"> no aplica</strong> para productos confeccionados conforme a las
              especificaciones del consumidor o claramente personalizados, ya que son fabricados exclusivamente
              según las indicaciones del cliente.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Garantía legal</h2>
          <p>
            Conforme al <strong className="text-white">artículo 7 de la Ley 1480 de 2011</strong>, todos nuestros
            productos cuentan con garantía legal contra defectos de fabricación:
          </p>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70 mt-3">
            <li>La garantía cubre defectos de calidad, idoneidad o seguridad del producto.</li>
            <li>No cubre daños ocasionados por mal uso, desgaste normal, o modificaciones realizadas por el cliente.</li>
            <li>Para hacer efectiva la garantía, el cliente debe contactarnos dentro del término legal con la descripción del defecto y fotos del producto.</li>
            <li>Publidiseños Yoyer evaluará la reclamación y ofrecerá reparación, cambio o devolución del dinero según corresponda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Devoluciones y reembolsos</h2>
          <p className="mb-3">Para conocer en detalle nuestra política de devoluciones, visita:</p>
          <Link to="/politica-devoluciones" className="text-primary-400 hover:underline font-medium">
            Política de Devoluciones y Cambios
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Cuenta de usuario</h2>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li>El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>Toda actividad realizada desde una cuenta es responsabilidad de su titular.</li>
            <li>El usuario debe proporcionar información veraz y actualizada.</li>
            <li>Publidiseños Yoyer se reserva el derecho de suspender cuentas que incumplan estos términos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Propiedad intelectual</h2>
          <p>
            Todo el contenido del sitio web (diseños, logotipos, textos, imágenes, código fuente) es propiedad
            de Publidiseños Yoyer o de sus respectivos titulares y está protegido por las leyes de propiedad
            intelectual colombianas (<strong className="text-white">Ley 23 de 1982</strong> y
            <strong className="text-white"> Decisión Andina 351 de 1993</strong>).
            Queda prohibida su reproducción, distribución o uso sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">11. Reseñas y comentarios</h2>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li>Los clientes pueden dejar reseñas y calificaciones sobre los productos adquiridos.</li>
            <li>Las reseñas son moderadas antes de su publicación para garantizar un contenido respetuoso.</li>
            <li>Publidiseños Yoyer se reserva el derecho de no publicar reseñas que contengan lenguaje ofensivo, spam o contenido no relacionado con el producto.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">12. Limitación de responsabilidad</h2>
          <p>
            Publidiseños Yoyer no será responsable por daños indirectos, incidentales o consecuentes derivados
            del uso del sitio web. No garantizamos la disponibilidad ininterrumpida del sitio ni la ausencia
            de errores técnicos, aunque nos esforzamos por mantener el servicio en óptimas condiciones.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">13. Resolución de conflictos</h2>
          <p>
            Cualquier controversia derivada de estos términos se resolverá preferiblemente de forma amigable.
            En caso de no llegar a un acuerdo, las partes se someterán a la jurisdicción de los jueces y
            tribunales competentes de la República de Colombia, de conformidad con la Ley 1480 de 2011.
          </p>
          <p className="mt-2">
            El consumidor también puede acudir a la <strong className="text-white">Superintendencia de Industria y Comercio (SIC)</strong> para
            presentar quejas o reclamaciones.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">14. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán
            publicados en esta página. El uso continuado del sitio después de los cambios implica su aceptación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">15. Contacto</h2>
          <p>Para preguntas sobre estos términos y condiciones:</p>
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
