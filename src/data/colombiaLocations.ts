/**
 * Departamentos y municipios principales de Colombia.
 * Lista resumida con las cabeceras municipales y ciudades más usadas para envíos.
 * Si necesitas una ciudad que no aparece, edita este archivo.
 */
export const COLOMBIA_LOCATIONS: Record<string, string[]> = {
  Amazonas: ['Leticia', 'Puerto Nariño'],
  Antioquia: [
    'Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro',
    'Sabaneta', 'La Estrella', 'Copacabana', 'Caldas', 'Girardota', 'Marinilla',
    'El Carmen de Viboral', 'Caucasia', 'Yarumal', 'Santa Fe de Antioquia',
    'Necoclí', 'Chigorodó', 'La Ceja', 'Guarne',
  ],
  Arauca: ['Arauca', 'Tame', 'Saravena', 'Arauquita', 'Fortul', 'Puerto Rondón', 'Cravo Norte'],
  Atlántico: [
    'Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia',
    'Galapa', 'Baranoa', 'Sabanagrande', 'Palmar de Varela',
  ],
  Bolívar: [
    'Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar',
    'San Pablo', 'Mompós', 'Santa Rosa del Sur', 'María la Baja',
  ],
  Boyacá: [
    'Tunja', 'Sogamoso', 'Duitama', 'Chiquinquirá', 'Paipa', 'Villa de Leyva',
    'Puerto Boyacá', 'Moniquirá', 'Garagoa', 'Samacá', 'Nobsa',
  ],
  Caldas: [
    'Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio',
    'Anserma', 'Supía', 'Aguadas', 'Salamina', 'Neira',
  ],
  Caquetá: [
    'Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'La Montañita',
    'El Doncello', 'El Paujil', 'Belén de los Andaquíes',
  ],
  Casanare: [
    'Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Monterrey', 'Paz de Ariporo',
    'Trinidad', 'Hato Corozal', 'Pore',
  ],
  Cauca: [
    'Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía (El Bordo)',
    'Piendamó', 'Caloto', 'Miranda', 'Guapi', 'Silvia', 'Timbío',
  ],
  Cesar: [
    'Valledupar', 'Aguachica', 'Bosconia', 'Codazzi', 'La Jagua de Ibirico',
    'Curumaní', 'Chiriguaná', 'San Alberto', 'San Martín',
  ],
  Chocó: [
    'Quibdó', 'Istmina', 'Tadó', 'Condoto', 'Bahía Solano', 'Nuquí',
    'Riosucio', 'Acandí',
  ],
  Córdoba: [
    'Montería', 'Lorica', 'Cereté', 'Sahagún', 'Planeta Rica', 'Tierralta',
    'Montelíbano', 'Ciénaga de Oro', 'Chinú', 'Puerto Libertador',
  ],
  Cundinamarca: [
    'Soacha', 'Fusagasugá', 'Facatativá', 'Zipaquirá', 'Chía', 'Mosquera',
    'Madrid', 'Funza', 'Cajicá', 'Girardot', 'Cota', 'La Calera',
    'Tabio', 'Tenjo', 'Sopó', 'Tocancipá', 'Ubaté', 'Pacho', 'La Mesa',
    'Anapoima', 'Villeta', 'Gachetá',
  ],
  Guainía: ['Inírida'],
  Guaviare: ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores'],
  Huila: [
    'Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'Gigante',
    'San Agustín', 'Aipe', 'Rivera', 'Palermo',
  ],
  'La Guajira': [
    'Riohacha', 'Maicao', 'Uribia', 'Manaure', 'San Juan del Cesar',
    'Villanueva', 'Fonseca', 'Barrancas', 'Albania', 'Dibulla',
  ],
  Magdalena: [
    'Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato', 'Aracataca',
    'Pivijay', 'Zona Bananera', 'El Retén',
  ],
  Meta: [
    'Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín',
    'Puerto Gaitán', 'Cumaral', 'Restrepo', 'Castilla la Nueva',
  ],
  Nariño: [
    'Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'La Unión', 'Samaniego',
    'Sandoná', 'Barbacoas', 'El Charco', 'Buesaco',
  ],
  'Norte de Santander': [
    'Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios',
    'Tibú', 'El Zulia', 'Chinácota', 'Sardinata', 'Ábrego',
  ],
  Putumayo: [
    'Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez (La Hormiga)',
    'Sibundoy', 'Villagarzón', 'San Miguel', 'Puerto Leguízamo',
  ],
  Quindío: [
    'Armenia', 'Calarcá', 'Montenegro', 'Quimbaya', 'La Tebaida',
    'Circasia', 'Filandia', 'Salento', 'Pijao', 'Génova',
  ],
  Risaralda: [
    'Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia',
    'Belén de Umbría', 'Quinchía', 'Apía', 'Marsella', 'Mistrató',
  ],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  Santander: [
    'Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja',
    'San Gil', 'Socorro', 'Málaga', 'Vélez', 'Barbosa', 'Lebrija', 'Zapatoca',
    'Puerto Wilches',
  ],
  Sucre: [
    'Sincelejo', 'Corozal', 'Sampués', 'San Marcos', 'Tolú', 'Coveñas',
    'San Onofre', 'Majagual', 'Sucre',
  ],
  Tolima: [
    'Ibagué', 'Espinal', 'Melgar', 'Mariquita', 'Honda', 'Líbano', 'Chaparral',
    'Fresno', 'Purificación', 'Flandes', 'Guamo', 'Saldaña',
  ],
  'Valle del Cauca': [
    'Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Jamundí',
    'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'Sevilla', 'Zarzal',
    'La Unión', 'Roldanillo', 'Caicedonia',
  ],
  Vaupés: ['Mitú', 'Carurú', 'Taraira'],
  Vichada: ['Puerto Carreño', 'La Primavera', 'Santa Rosalía', 'Cumaribo'],
  'Bogotá D.C.': ['Bogotá'],
};

export const COLOMBIA_DEPARTMENTS = Object.keys(COLOMBIA_LOCATIONS).sort((a, b) =>
  a.localeCompare(b, 'es')
);

export function citiesOf(department: string): string[] {
  return COLOMBIA_LOCATIONS[department] || [];
}
