import { Link } from 'react-router-dom';

export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Política de Devoluciones y Cambios</h1>
      <p className="text-purple-400/60 text-sm mb-8">Última actualización: Abril 2026</p>

      <div className="space-y-8 text-purple-200/80 leading-relaxed">
        <section>
          <p>
            En <strong className="text-white">Publidiseños Yoyer</strong> queremos que estés completamente satisfecho
            con tu compra. Esta política de devoluciones y cambios se rige por la
            <strong className="text-white"> Ley 1480 de 2011</strong> (Estatuto del Consumidor de Colombia).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Derecho de retracto</h2>
          <div className="bg-purple-950/50 border border-purple-700/30 rounded-lg p-5">
            <p className="mb-3">
              Tienes derecho a retractarte de tu compra dentro de los
              <strong className="text-white"> cinco (5) días hábiles</strong> siguientes a la recepción del producto,
              conforme al artículo 47 de la Ley 1480 de 2011.
            </p>
            <p className="font-medium text-white mb-2">Condiciones:</p>
            <ul className="space-y-1 text-sm list-disc list-inside text-purple-300/70">
              <li>El producto debe estar sin uso, en su empaque original y en perfecto estado.</li>
              <li>Deben conservarse todas las etiquetas, accesorios y documentación.</li>
              <li>El costo de envío de la devolución corre por cuenta del comprador.</li>
            </ul>
          </div>

          <div className="mt-4 bg-secondary-500/10 border border-secondary-500/30 rounded-lg p-5">
            <p className="text-secondary-400 font-semibold mb-2">Productos personalizados — Excepción</p>
            <p className="text-sm text-purple-300/70">
              De acuerdo con el artículo 47, parágrafo de la Ley 1480 de 2011, el derecho de retracto
              <strong className="text-purple-200"> NO aplica</strong> para productos fabricados conforme a las
              especificaciones del consumidor o claramente personalizados. Esto incluye todos los productos
              que hayan sido personalizados con textos, imágenes o colores específicos indicados por el cliente.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Garantía por defectos</h2>
          <p className="mb-3">
            Si recibes un producto con defectos de fabricación o que no corresponde a lo que ordenaste,
            tienes derecho a reclamar la garantía legal. Aceptamos reclamaciones en los siguientes casos:
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="font-semibold text-green-400 mb-2">Aceptamos devolución/cambio</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-purple-300/70">
                <li>Producto con defecto de fabricación</li>
                <li>Producto diferente al ordenado</li>
                <li>Producto dañado durante el envío</li>
                <li>Error en la personalización imputable a Publidiseños</li>
                <li>Falta de conformidad con la descripción del sitio</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="font-semibold text-red-400 mb-2">No aceptamos devolución</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-purple-300/70">
                <li>Daño por mal uso del producto</li>
                <li>Desgaste natural por el uso</li>
                <li>Producto personalizado sin defecto</li>
                <li>Error en los datos de personalización proporcionados por el cliente</li>
                <li>No gustar el producto recibido (si es personalizado)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Proceso de devolución</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <p className="font-medium text-white">Contactar a Publidiseños Yoyer</p>
                <p className="text-sm text-purple-300/70">
                  Envía un correo a <a href="mailto:publidisenosyoyer@gmail.com" className="text-primary-400 hover:underline">publidisenosyoyer@gmail.com</a> o
                  escríbenos por <a href="https://wa.me/573502362979" className="text-primary-400 hover:underline">WhatsApp</a> dentro
                  de los 5 días hábiles posteriores a la recepción. Incluye: número de pedido, descripción del problema y fotos del producto.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <p className="font-medium text-white">Evaluación</p>
                <p className="text-sm text-purple-300/70">
                  Nuestro equipo evaluará tu solicitud en un plazo máximo de 3 días hábiles y te comunicará
                  si procede la devolución, cambio o reembolso.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <p className="font-medium text-white">Envío del producto</p>
                <p className="text-sm text-purple-300/70">
                  Si se aprueba la devolución, te indicaremos la dirección y el medio para enviar el producto.
                  En caso de defectos de fabricación o errores nuestros, cubrimos el costo del envío de retorno.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <div>
                <p className="font-medium text-white">Resolución</p>
                <p className="text-sm text-purple-300/70">
                  Una vez recibido y verificado el producto, procederemos con una de las siguientes opciones
                  según tu preferencia y la naturaleza del caso:
                </p>
                <ul className="text-sm list-disc list-inside text-purple-300/70 mt-2 space-y-1">
                  <li><strong className="text-purple-200">Cambio:</strong> Envío de un nuevo producto sin costo adicional.</li>
                  <li><strong className="text-purple-200">Reparación:</strong> Si el defecto es reparable, lo corregiremos sin costo.</li>
                  <li><strong className="text-purple-200">Reembolso:</strong> Devolución del valor pagado por el mismo medio de pago, en un plazo de 5 a 15 días hábiles según la entidad financiera.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Plazos de reembolso</h2>
          <div className="bg-purple-950/50 border border-purple-700/30 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-purple-300/70">
              <li><strong className="text-purple-200">Tarjeta de crédito/débito:</strong> 5 a 15 días hábiles, dependiendo de la entidad bancaria.</li>
              <li><strong className="text-purple-200">PSE / transferencia:</strong> 5 a 10 días hábiles.</li>
              <li><strong className="text-purple-200">Otros medios:</strong> Según el medio de pago utilizado, se coordinará directamente con el cliente.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Cancelación de pedidos</h2>
          <ul className="space-y-2 text-sm list-disc list-inside text-purple-300/70">
            <li>Puedes cancelar un pedido <strong className="text-purple-200">antes de que entre en producción</strong>, solicitándolo por correo o WhatsApp.</li>
            <li>Si el pedido ya está en producción (especialmente productos personalizados), no será posible cancelarlo.</li>
            <li>Para pedidos cancelados a tiempo, el reembolso se realizará por el mismo medio de pago.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Reclamaciones ante la SIC</h2>
          <p>
            Si no estás satisfecho con la resolución de tu caso, puedes presentar una reclamación ante la
            <strong className="text-white"> Superintendencia de Industria y Comercio (SIC)</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-purple-300/70">
            <li>Sitio web: www.sic.gov.co</li>
            <li>Línea gratuita nacional: 01 8000 910 165</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Contacto</h2>
          <p>Para iniciar una devolución o resolver dudas:</p>
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
