'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface I18nState {
  locale: 'en' | 'es'
  setLocale: (locale: 'en' | 'es') => void
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'flyinguate-locale',
    }
  )
)

// Translation function
export const t = (key: string, locale: 'en' | 'es' = 'en'): string => {
  const translations: Record<string, Record<'en' | 'es', string>> = {
    // Navigation
    'nav.home': { en: 'Home', es: 'Inicio' },
    'nav.experiences': { en: 'Experiences', es: 'Experiencias' },
    'nav.transport': { en: 'Transport', es: 'Transporte' },
    'nav.pilot_opportunities': { en: 'Pilot Opportunities', es: 'Oportunidades para Pilotos' },
    'nav.login': { en: 'Login', es: 'Iniciar Sesión' },
    'nav.register': { en: 'Register', es: 'Registrarse' },

    // Homepage
    'hero.title': { 
      en: 'Experience Guatemala from Above', 
      es: 'Experimenta Guatemala desde las Alturas' 
    },
    'hero.subtitle': { 
      en: 'Premium helicopter transport and exclusive aerial experiences across Guatemala\'s most breathtaking destinations', 
      es: 'Transporte premium en helicóptero y experiencias aéreas exclusivas por los destinos más impresionantes de Guatemala' 
    },

    // Services
    'services.transport.title': { en: 'Direct Transport', es: 'Transporte Directo' },
    'services.transport.description': { 
      en: 'Point-to-point helicopter transport between airports and custom airfields. Fast, convenient, and luxurious travel across Guatemala.',
      es: 'Transporte en helicóptero punto a punto entre aeropuertos y pistas personalizadas. Viajes rápidos, convenientes y lujosos por Guatemala.'
    },
    'services.transport.cta': { en: 'Book Transport', es: 'Reservar Transporte' },
    
    'services.experiences.title': { en: 'Experiences', es: 'Experiencias' },
    'services.experiences.description': { 
      en: 'Curated aerial tours, hotel packages in Antigua and Lake Atitlán, and exclusive sightseeing experiences.',
      es: 'Tours aéreos curados, paquetes de hotel en Antigua y Lago Atitlán, y experiencias exclusivas de turismo.'
    },
    'services.experiences.cta': { en: 'Explore Experiences', es: 'Explorar Experiencias' },

    // How it works
    'how_it_works.title': { en: 'How It Works', es: 'Cómo Funciona' },
    'how_it_works.step1.title': { en: 'Book Your Flight', es: 'Reserva tu Vuelo' },
    'how_it_works.step1.description': { en: 'Choose transport or experience package', es: 'Elige transporte o paquete de experiencia' },
    'how_it_works.step2.title': { en: 'Get Confirmed', es: 'Obtén Confirmación' },
    'how_it_works.step2.description': { en: 'Receive confirmation with pilot details', es: 'Recibe confirmación con detalles del piloto' },
    'how_it_works.step3.title': { en: 'Fly in Style', es: 'Vuela con Estilo' },
    'how_it_works.step3.description': { en: 'Enjoy your premium helicopter experience', es: 'Disfruta tu experiencia premium en helicóptero' },

    // Booking forms
    'booking.form.from': { en: 'From', es: 'Desde' },
    'booking.form.to': { en: 'To', es: 'Hacia' },
    'booking.form.date': { en: 'Date', es: 'Fecha' },
    'booking.form.time': { en: 'Preferred Time', es: 'Hora Preferida' },
    'booking.form.passengers': { en: 'Passengers', es: 'Pasajeros' },
    'booking.form.notes': { en: 'Special Requests (Optional)', es: 'Solicitudes Especiales (Opcional)' },
    'booking.form.aircraft': { en: 'Helicopter Selection', es: 'Selección de Helicóptero' },
    'booking.form.price_breakdown': { en: 'Price Breakdown', es: 'Desglose de Precio' },
    'booking.form.route_details': { en: 'Route Details', es: 'Detalles de Ruta' },
    'booking.form.schedule': { en: 'Schedule', es: 'Horario' },
    'booking.form.cancel': { en: 'Cancel', es: 'Cancelar' },
    'booking.form.book_flight': { en: 'Book Flight', es: 'Reservar Vuelo' },

    // Pricing
    'pricing.distance': { en: 'Distance', es: 'Distancia' },
    'pricing.flight_time': { en: 'Flight Time', es: 'Tiempo de Vuelo' },
    'pricing.base_price': { en: 'Base Price', es: 'Precio Base' },
    'pricing.additional_passengers': { en: 'Additional Passengers', es: 'Pasajeros Adicionales' },
    'pricing.total': { en: 'Total', es: 'Total' },
    'pricing.route': { en: 'Route', es: 'Ruta' },
    'pricing.select_destinations': { en: 'Select departure and destination to see pricing', es: 'Selecciona origen y destino para ver precios' },

    // Common
    'common.minutes': { en: 'minutes', es: 'minutos' },
    'common.hours': { en: 'hours', es: 'horas' },
    'common.passenger': { en: 'Passenger', es: 'Pasajero' },
    'common.passengers': { en: 'Passengers', es: 'Pasajeros' },
    'common.loading': { en: 'Loading...', es: 'Cargando...' },
    'common.select': { en: 'Select', es: 'Seleccionar' },
    'common.book_now': { en: 'Book Now', es: 'Reservar Ahora' },
    'common.welcome': { en: 'Welcome', es: 'Bienvenido' },
    'common.max': { en: 'Max', es: 'Máx' },
    
    // Pilot recruitment
    'pilot.title': { en: 'Fly with FlyInGuate', es: 'Vuela con FlyInGuate' },
    'pilot.subtitle': { 
      en: 'Join Guatemala\'s premier helicopter pilot network. Earn premium rates while showcasing the beauty of our country to travelers from around the world.',
      es: 'Únete a la red premier de pilotos de helicóptero de Guatemala. Gana tarifas premium mientras muestras la belleza de nuestro país a viajeros de todo el mundo.'
    },
    'pilot.apply_now': { en: 'Apply Now', es: 'Aplicar Ahora' },
    'pilot.view_portal': { en: 'View Pilot Portal', es: 'Ver Portal de Piloto' },

    // Experience categories
    'category.scenic': { en: 'Scenic Tours', es: 'Tours Panorámicos' },
    'category.romantic': { en: 'Romantic Experiences', es: 'Experiencias Románticas' },
    'category.cultural': { en: 'Cultural Tours', es: 'Tours Culturales' },
    'category.volcano': { en: 'Volcano Tours', es: 'Tours de Volcanes' },
    'category.beach': { en: 'Beach & Coast', es: 'Playa y Costa' },
    'category.adventure': { en: 'Adventure Packages', es: 'Paquetes de Aventura' },
  }

  return translations[key]?.[locale] || key
}

// Hook for translations
export const useTranslation = () => {
  const { locale } = useI18n()
  
  return {
    t: (key: string) => t(key, locale),
    locale,
  }
}