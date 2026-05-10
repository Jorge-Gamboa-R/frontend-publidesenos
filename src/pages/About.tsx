import { useEffect, useState } from 'react';
import { FaBullseye, FaEye } from 'react-icons/fa';
import { settingsService } from '../services/settings.service';

/**
 * Página "Nosotros" - Misión y Visión de Publidiseños Yoyer
 */
export default function About() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    settingsService.getPublic().then(data => setSettings(data.settings));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white text-center mb-12">Sobre Nosotros</h1>

      <div className="space-y-12">
        <div className="bg-purple-950/50 rounded-2xl p-8 border border-purple-700/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-600/20 rounded-full text-primary-400"><FaBullseye size={24} /></div>
            <h2 className="text-2xl font-bold text-white">Nuestra Misión</h2>
          </div>
          <p className="text-purple-200/80 leading-relaxed text-lg">
            {settings.mission || 'Brindar soluciones creativas de personalización y diseño publicitario, transformando las ideas de nuestros clientes en productos únicos y de alta calidad que comuniquen su identidad.'}
          </p>
        </div>

        <div className="bg-purple-950/50 rounded-2xl p-8 border border-purple-700/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-600/20 rounded-full text-primary-400"><FaEye size={24} /></div>
            <h2 className="text-2xl font-bold text-white">Nuestra Visión</h2>
          </div>
          <p className="text-purple-200/80 leading-relaxed text-lg">
            {settings.vision || 'Ser la empresa líder en personalización y diseño publicitario en Colombia, reconocida por la innovación, calidad y compromiso con la satisfacción de nuestros clientes.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">¿Listo para crear algo único?</h2>
          <p className="text-purple-100 mb-6">Contáctanos y hagamos realidad tu idea</p>
          <a href="https://wa.me/573502362979" target="_blank" rel="noopener noreferrer"
            className="inline-block bg-white text-primary-700 px-8 py-3 rounded-full font-bold hover:bg-secondary-100 transition-colors">
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
}
