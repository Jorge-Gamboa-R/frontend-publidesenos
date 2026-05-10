import { useState } from 'react';
import { FaWhatsapp, FaInstagram, FaTiktok, FaFacebookF, FaTimes, FaShareAlt } from 'react-icons/fa';

const WHATSAPP_NUMBER = '573502362979';
const WHATSAPP_MESSAGE = '¡Hola! Me interesa conocer más sobre sus productos personalizados.';
const INSTAGRAM_URL = 'https://www.instagram.com/publidisenosyoyer/';
const TIKTOK_URL = 'https://www.tiktok.com/@publidisenosyoyer';
const FACEBOOK_URL = 'https://www.facebook.com/share/1ET7v2Q8m4/?mibextid=wwXIfr';

const socials = [
  {
    label: 'Instagram',
    href: INSTAGRAM_URL,
    Icon: FaInstagram,
    className: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
  },
  {
    label: 'TikTok',
    href: TIKTOK_URL,
    Icon: FaTiktok,
    className: 'bg-black',
  },
  {
    label: 'Facebook',
    href: FACEBOOK_URL,
    Icon: FaFacebookF,
    className: 'bg-blue-600',
  },
];

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {socials.map(({ label, href, Icon, className }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg text-white hover:scale-110 transition-transform ${className}`}
          >
            <Icon size={20} />
          </a>
        ))}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          title="WhatsApp"
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white hover:scale-110 transition-transform"
        >
          <FaWhatsapp size={22} />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar redes sociales' : 'Abrir redes sociales'}
        aria-expanded={open}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white hover:scale-110 transition-all duration-300 ${
          open ? 'bg-gray-700 hover:bg-gray-800 rotate-90' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {open ? <FaTimes size={22} /> : <FaShareAlt size={22} />}
      </button>
    </div>
  );
}
