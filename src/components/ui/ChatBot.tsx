import { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot, FaUser, FaShoppingCart } from 'react-icons/fa';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import type { Product, Category } from '../../types';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  options?: Option[];
  products?: Product[];
}

interface Option {
  label: string;
  action: string;
}

const FLOWS: Record<string, { text: string; options?: Option[] }> = {
  welcome: {
    text: '¡Hola! Soy el asistente virtual de Publidiseños Yoyer. ¿En qué puedo ayudarte?',
    options: [
      { label: '¿Qué productos ofrecen?', action: 'productos' },
      { label: '¿Cómo hago un pedido?', action: 'pedido' },
      { label: 'Métodos de pago', action: 'pagos' },
      { label: 'Envíos y entregas', action: 'envios' },
      { label: 'Personalización', action: 'personalizacion' },
      { label: 'Contactar soporte', action: 'contacto' },
    ],
  },
  productos: {
    text: 'En Publidiseños Yoyer ofrecemos una gran variedad de productos personalizables: camisetas, gorras, mugs, llaveros, botones, stickers y mucho más. Puedes explorar todo nuestro catálogo en la sección de productos.',
    options: [
      { label: 'Ver catálogo', action: 'link_catalogo' },
      { label: '¿Puedo personalizar?', action: 'personalizacion' },
      { label: 'Volver al menú', action: 'welcome' },
    ],
  },
  pedido: {
    text: 'Hacer un pedido es muy fácil:\n\n1. Explora nuestro catálogo y elige tus productos\n2. Personalízalos con tu texto, imagen o color\n3. Agrégalos al carrito\n4. Ve al checkout, selecciona dirección y método de pago\n5. ¡Confirma tu pedido!\n\nNecesitas una cuenta para comprar. Si no tienes una, puedes crearla gratis.',
    options: [
      { label: 'Crear cuenta', action: 'link_registro' },
      { label: 'Ver catálogo', action: 'link_catalogo' },
      { label: 'Volver al menú', action: 'welcome' },
    ],
  },
  pagos: {
    text: 'Aceptamos los siguientes métodos de pago:\n\n• Tarjeta de crédito\n• Tarjeta débito\n• PSE (transferencia bancaria)\n• Contra entrega (pago al recibir)\n\nTodos los pagos son seguros y procesados de forma encriptada.',
    options: [
      { label: '¿Hacen envíos?', action: 'envios' },
      { label: '¿Cómo hago un pedido?', action: 'pedido' },
      { label: 'Volver al menú', action: 'welcome' },
    ],
  },
  envios: {
    text: 'Realizamos envíos a toda Colombia.\n\n• Envío gratis en compras mayores a $150.000\n• Envío estándar: $12.000\n• Tiempo de entrega: 3-7 días hábiles según tu ubicación\n\nUna vez confirmado tu pedido, recibirás actualizaciones sobre el estado de tu envío.',
    options: [
      { label: 'Métodos de pago', action: 'pagos' },
      { label: '¿Cómo hago un pedido?', action: 'pedido' },
      { label: 'Volver al menú', action: 'welcome' },
    ],
  },
  personalizacion: {
    text: '¡Nos encanta la personalización! Según el producto puedes:\n\n• Agregar texto personalizado (nombres, frases, fechas)\n• Subir tu propia imagen o diseño\n• Elegir entre varios colores disponibles\n\nCada producto indica qué opciones de personalización están disponibles en su página de detalle.',
    options: [
      { label: 'Ver catálogo', action: 'link_catalogo' },
      { label: '¿Cómo hago un pedido?', action: 'pedido' },
      { label: 'Volver al menú', action: 'welcome' },
    ],
  },
  contacto: {
    text: 'Puedes contactarnos por cualquiera de estos medios:\n\n• WhatsApp: 350 236 2979\n• Email: publidisenosyoyer@gmail.com\n• Formulario de contacto en nuestra página\n\nNuestro horario de atención es de lunes a sábado, 8:00 AM a 6:00 PM.',
    options: [
      { label: 'WhatsApp', action: 'link_whatsapp' },
      { label: 'Ir a contacto', action: 'link_contacto' },
      { label: 'Volver al menú', action: 'welcome' },
    ],
  },
  seguimiento: {
    text: 'Para ver el estado de tu pedido:\n\n1. Inicia sesión en tu cuenta\n2. Ve a "Mi Cuenta" → "Mis Pedidos"\n3. Haz clic en el pedido que quieras consultar\n\nAhí verás el estado actual y los detalles de tu orden.',
    options: [
      { label: 'Iniciar sesión', action: 'link_login' },
      { label: 'Contactar soporte', action: 'contacto' },
      { label: 'Volver al menú', action: 'welcome' },
    ],
  },
  default: {
    text: 'No tengo una respuesta para eso, pero puedo ayudarte con las siguientes opciones:',
    options: [
      { label: '¿Qué productos ofrecen?', action: 'productos' },
      { label: '¿Cómo hago un pedido?', action: 'pedido' },
      { label: 'Seguimiento de pedido', action: 'seguimiento' },
      { label: 'Contactar soporte', action: 'contacto' },
    ],
  },
};

// Solo flujos conversacionales muy específicos (saludos y preguntas frecuentes).
// El resto cae al buscador dinámico para no quedarse desactualizado.
const KEYWORD_MAP: [RegExp, string][] = [
  [/^(?:¿|que|qué)\s*ofrecen[\s?!.]*$|^catalogo$|^catálogo$/i, 'productos'],
  [/como.*(?:hago|hacer).*pedido|como.*(?:comprar|ordenar)/i, 'pedido'],
  [/(?:metodos?|forma).*pago|como.*pago|como.*pagar/i, 'pagos'],
  [/(?:envio|envío|entrega|domicilio|despacho)\s*(?:gratis|costo|cuanto|cuánto|cómo|como|info|información)?[\s?!.]*$/i, 'envios'],
  [/^personaliz|como.*personaliz/i, 'personalizacion'],
  [/contacto|contactar|whatsapp|telefono|teléfono/i, 'contacto'],
  [/seguimiento|estado.*pedido|rastrear|rastreo|donde.*pedido|dónde.*pedido/i, 'seguimiento'],
  [/^(?:hola|buenas|buenos|hey|saludos|holi|hi|hello|qué tal|que tal)[\s,!.]*$/i, 'welcome'],
];

// Verbos que indican búsqueda explícita de producto. Si aparece, todo lo que va después es la query.
const PRODUCT_SEARCH_REGEX = /(?:busco|buscar|quiero|necesito|tienen|tienes|hay|venden|vende|ofrecen|ofrece|mostrar|ver|dame|muestrame|muéstrame|me interesa|quisiera|donde encuentro|dónde encuentro)\s+(.+)/i;

// Palabras de relleno y preguntas que conviene quitar para que la búsqueda sea más limpia.
const STOPWORDS_RE = /\b(?:que|qué|cual|cuál|cuales|cuáles|como|cómo|donde|dónde|hay|tienen|tiene|tienes|venden|vende|por\s+favor|de|el|la|los|las|un|una|unos|unas|para|con|sobre|me|info|información)\b/gi;

function matchKeyword(text: string): string {
  for (const [regex, action] of KEYWORD_MAP) {
    if (regex.test(text)) return action;
  }
  return 'default';
}

// Limpia el texto de búsqueda para enviar al API
function cleanSearchQuery(text: string): string {
  return text
    .replace(/[¿?¡!.,;]+/g, ' ')
    .replace(STOPWORDS_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractProductSearch(text: string): string | null {
  // Si hay un verbo de búsqueda explícito, todo lo que sigue es la query.
  const match = text.match(PRODUCT_SEARCH_REGEX);
  if (match) {
    const cleaned = cleanSearchQuery(match[1]);
    return cleaned.length >= 2 ? cleaned : null;
  }
  return null;
}

let msgId = 0;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (flowKey: string) => {
    const flow = FLOWS[flowKey] || FLOWS.default;
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: ++msgId, text: flow.text, sender: 'bot', options: flow.options }]);
      setIsTyping(false);
    }, 600);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addBotMessage('welcome');
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleOption = (action: string) => {
    if (action.startsWith('link_')) {
      // Links dinámicos de categoría
      if (action.startsWith('link_category_')) {
        const slug = action.replace('link_category_', '');
        window.location.href = `/catalogo/${slug}`;
        return;
      }

      const links: Record<string, string> = {
        link_catalogo: '/catalogo',
        link_registro: '/registro',
        link_login: '/login',
        link_contacto: '/contacto',
        link_whatsapp: 'https://wa.me/573502362979',
      };
      const url = links[action];
      if (url?.startsWith('http')) {
        window.open(url, '_blank');
      } else if (url) {
        window.location.href = url;
      }
      return;
    }

    const flow = FLOWS[action];
    if (flow) {
      setMessages(prev => [...prev, { id: ++msgId, text: flow.options?.find(o => o.action === action)?.label || action, sender: 'user' }]);
    }
    addBotMessage(action);
  };

  const searchProducts = async (query: string) => {
    setIsTyping(true);
    try {
      // Buscar categorías primero (siempre se cargan en vivo desde el backend,
      // así nuevas categorías agregadas en el admin se detectan al instante).
      const categories = await categoryService.getAll().catch(() => [] as Category[]);

      // Normaliza eliminando acentos y plurales para hacer un match más permisivo.
      const norm = (s: string) =>
        s
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/s$/, '');
      const queryNorm = norm(query);
      const queryWords = queryNorm.split(/\s+/).filter(w => w.length >= 3).map(norm);

      // Coincidencia: que cualquier palabra del query (>=3 chars) coincida con el nombre o slug.
      const matchedCategory = categories.find(cat => {
        const nameNorm = norm(cat.name);
        const slugNorm = norm(cat.slug);
        if (nameNorm.includes(queryNorm) || slugNorm.includes(queryNorm)) return true;
        if (queryNorm.includes(nameNorm)) return true;
        return queryWords.some(w => nameNorm.includes(w) || slugNorm.includes(w));
      });

      // Buscar productos por texto libre, y también por categoría si coincide.
      // Probamos también con cada palabra significativa del query por si la
      // búsqueda completa no devuelve nada (ej. "tazas decoradas" → "tazas").
      const searchPromises = [
        productService.getProducts({ search: query, limit: 4 }),
      ];
      if (matchedCategory) {
        searchPromises.push(
          productService.getProducts({ category: matchedCategory.slug, limit: 4 })
        );
      }
      for (const word of queryWords) {
        if (word !== queryNorm) {
          searchPromises.push(productService.getProducts({ search: word, limit: 4 }));
        }
      }

      const results = await Promise.all(searchPromises.map(p => p.catch(() => ({ products: [] as Product[] }))));

      // Combinar productos sin duplicados.
      const allProducts = new Map<string, Product>();
      for (const result of results) {
        for (const product of result.products) {
          allProducts.set(product.id, product);
        }
      }
      const products = Array.from(allProducts.values()).slice(0, 4);

      const options: Option[] = [];
      if (matchedCategory) {
        options.push({ label: `Ver categoría: ${matchedCategory.name}`, action: `link_category_${matchedCategory.slug}` });
      }
      options.push({ label: 'Ver todo el catálogo', action: 'link_catalogo' });
      options.push({ label: 'Buscar otra cosa', action: 'welcome' });

      if (products.length > 0) {
        const categoryText = matchedCategory
          ? `\n\nTambién puedes ver todos los productos de la categoría "${matchedCategory.name}".`
          : '';
        setMessages(prev => [...prev, {
          id: ++msgId,
          text: `Encontré ${products.length} producto${products.length > 1 ? 's' : ''} relacionados con "${query}":${categoryText}`,
          sender: 'bot',
          products,
          options,
        }]);
      } else if (matchedCategory) {
        setMessages(prev => [...prev, {
          id: ++msgId,
          text: `Encontré la categoría "${matchedCategory.name}" pero no tiene productos disponibles aún. Puedes explorar el catálogo completo.`,
          sender: 'bot',
          options,
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: ++msgId,
          text: `No encontré productos con "${query}". Puedes explorar nuestro catálogo completo o contactarnos para algo más específico.`,
          sender: 'bot',
          options: [
            { label: 'Ver catálogo', action: 'link_catalogo' },
            { label: 'Contactar soporte', action: 'contacto' },
            { label: 'Volver al menú', action: 'welcome' },
          ],
        }]);
      }
    } catch {
      addBotMessage('default');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: ++msgId, text, sender: 'user' }]);
    setInput('');

    // Prioridad 1: búsqueda explícita con verbo ("busco mugs", "quiero camisetas").
    const explicitQuery = extractProductSearch(text);
    if (explicitQuery) {
      searchProducts(explicitQuery);
      return;
    }

    // Prioridad 2: flujos conversacionales fijos (saludos, FAQs).
    const matched = matchKeyword(text);
    if (matched !== 'default') {
      addBotMessage(matched);
      return;
    }

    // Prioridad 3: cualquier otra cosa con suficiente contenido se busca dinámicamente
    // contra productos y categorías reales del backend (así detectamos cualquier
    // categoría o producto recién agregado por el admin sin tener que tocar código).
    const cleanedQuery = cleanSearchQuery(text);
    if (cleanedQuery.length >= 2) {
      searchProducts(cleanedQuery);
      return;
    }

    addBotMessage('default');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button onClick={handleOpen}
          className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-full shadow-lg hover:from-primary-700 hover:to-secondary-600 hover:scale-110 transition-all animate-bounce"
          style={{ animationDuration: '2s', animationIterationCount: '3' }}>
          <FaCommentDots size={24} />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-2rem)] flex flex-col bg-[#1a0a2e] border border-purple-700/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white">
            <div className="flex items-center gap-2">
              <FaRobot size={20} />
              <div>
                <p className="font-semibold text-sm">Asistente Virtual</p>
                <p className="text-xs text-primary-100">Publidiseños Yoyer</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-700 rounded">
              <FaTimes size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'bot' ? 'bg-primary-600/20 text-primary-400' : 'bg-secondary-500/20 text-secondary-400'}`}>
                    {msg.sender === 'bot' ? <FaRobot size={14} /> : <FaUser size={12} />}
                  </div>
                  <div>
                    <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-line ${msg.sender === 'bot' ? 'bg-purple-950/80 text-purple-100 rounded-tl-none' : 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-tr-none'}`}>
                      {msg.text}
                    </div>
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.products.map(product => {
                          const img = product.images?.find(i => i.isPrimary) || product.images?.[0];
                          return (
                            <a key={product.id} href={`/producto/${product.slug}`}
                              className="flex items-center gap-3 p-2 bg-purple-900/40 border border-purple-700/30 rounded-lg hover:border-primary-500/50 transition-colors">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-purple-800/30 flex-shrink-0">
                                {img ? (
                                  <img src={img.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-purple-400">
                                    <FaShoppingCart size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-purple-100 truncate">{product.name}</p>
                                <p className="text-xs text-secondary-400 font-bold">
                                  ${Number(product.discountPrice || product.basePrice).toLocaleString('es-CO')} COP
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                    {msg.options && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.options.map(opt => (
                          <button key={opt.action} onClick={() => handleOption(opt.action)}
                            className="text-xs px-3 py-1.5 bg-purple-950/80 border border-purple-700/40 text-primary-300 rounded-full hover:bg-purple-900/50 hover:border-primary-500 transition-colors">
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center">
                  <FaRobot size={14} />
                </div>
                <div className="bg-purple-950/80 px-4 py-2 rounded-xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-purple-700/30 bg-[#1a0a2e]">
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Escribe tu pregunta..."
                className="flex-1 px-3 py-2 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none" />
              <button onClick={handleSend} disabled={!input.trim()}
                className="p-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-lg hover:from-primary-700 hover:to-secondary-600 disabled:from-purple-900 disabled:to-purple-900 disabled:text-purple-500 transition-all">
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
