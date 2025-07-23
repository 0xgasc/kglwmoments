'use client'

import Link from 'next/link'
import { Plane, MapPin, Sparkles } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function HomePage() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
          </div>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            <Link href="/pilot/join" className="hover:text-luxury-gold transition-colors">
              {t('nav.pilot_opportunities')}
            </Link>
            <Link href="/login" className="hover:text-luxury-gold transition-colors">
              {t('nav.login')}
            </Link>
            <Link href="/register" className="btn-luxury text-sm">
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="card-luxury hover:border-primary-200">
            <div className="flex items-center mb-4">
              <MapPin className="h-12 w-12 text-primary-600 mr-4" />
              <h2 className="text-2xl font-bold">{t('services.transport.title')}</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('services.transport.description')}
            </p>
            <Link href="/book/transport" className="btn-primary inline-block">
              {t('services.transport.cta')}
            </Link>
          </div>

          <div className="card-luxury hover:border-luxury-gold">
            <div className="flex items-center mb-4">
              <Sparkles className="h-12 w-12 text-luxury-gold mr-4" />
              <h2 className="text-2xl font-bold">{t('services.experiences.title')}</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('services.experiences.description')}
            </p>
            <Link href="/book/experiences" className="btn-luxury inline-block text-sm">
              {t('services.experiences.cta')}
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-8">{t('how_it_works.title')}</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-700">1</span>
              </div>
              <h4 className="font-semibold mb-2">{t('how_it_works.step1.title')}</h4>
              <p className="text-gray-600 text-sm">{t('how_it_works.step1.description')}</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-700">2</span>
              </div>
              <h4 className="font-semibold mb-2">{t('how_it_works.step2.title')}</h4>
              <p className="text-gray-600 text-sm">{t('how_it_works.step2.description')}</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-700">3</span>
              </div>
              <h4 className="font-semibold mb-2">{t('how_it_works.step3.title')}</h4>
              <p className="text-gray-600 text-sm">{t('how_it_works.step3.description')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}