'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plane, Menu, X, Home, User, Calendar, Settings, LogOut, Globe } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  show?: boolean
}

interface MobileNavProps {
  title?: string
  showBackButton?: boolean
  customActions?: React.ReactNode
  additionalMobileItems?: NavItem[]
}

export function MobileNav({ title = 'FlyInGuate', showBackButton = false, customActions, additionalMobileItems = [] }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { profile } = useAuthStore()
  const { locale, setLocale } = useI18n()
  const router = useRouter()

  const handleSignOut = async (e?: React.MouseEvent) => {
    console.log('handleSignOut called')
    
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Close menu immediately for better UX
    setIsOpen(false)
    
    try {
      console.log('Calling supabase.auth.signOut()')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase signOut error:', error)
      } else {
        console.log('Successfully signed out')
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
    
    // Always redirect regardless of success/failure
    console.log('Redirecting to home page')
    window.location.href = '/'
  }

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      show: true
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <Calendar className="h-5 w-5" />,
      show: !!profile
    },
    {
      href: '/admin',
      label: 'Admin Panel',
      icon: <Settings className="h-5 w-5" />,
      show: profile?.role === 'admin'
    },
    {
      href: '/pilot',
      label: 'Pilot Dashboard',
      icon: <Plane className="h-5 w-5" />,
      show: profile?.role === 'pilot'
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      show: !!profile
    }
  ]

  return (
    <>
      <nav className="bg-luxury-black text-white p-4 relative">
        <div className="flex items-center justify-between">
          {/* Left: Back button or logo */}
          <div className="flex items-center space-x-3">
            {showBackButton ? (
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <X className="h-6 w-6" />
              </button>
            ) : (
              <Link href="/" className="flex items-center space-x-2">
                <Plane className="h-6 w-6 text-luxury-gold" />
                <span className="text-lg font-bold hidden sm:block">{title}</span>
              </Link>
            )}
          </div>

          {/* Center: Page title on mobile */}
          <div className="flex-1 text-center sm:hidden">
            <span className="text-lg font-semibold">{title}</span>
          </div>

          {/* Right: Custom actions + menu button */}
          <div className="flex items-center space-x-2">
            {/* Show custom actions only on desktop */}
            <div className="hidden md:block">
              {customActions}
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.filter(item => item.show).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm hover:text-luxury-gold transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {profile && (
                <button
                  onClick={handleSignOut}
                  className="text-sm hover:text-luxury-gold transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-luxury-black border-t border-gray-700 md:hidden z-[60]">
            <div className="p-4 space-y-2">
              {/* Language switcher */}
              <button
                onClick={() => {
                  setLocale(locale === 'en' ? 'es' : 'en')
                  setIsOpen(false)
                }}
                className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
              >
                <Globe className="h-5 w-5" />
                <span>Language: {locale === 'en' ? 'English' : 'Español'}</span>
              </button>
              
              <div className="border-t border-gray-700 pt-2"></div>
              
              {/* Main navigation items for logged in users */}
              {navItems.filter(item => item.show).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Additional mobile items (for public pages) */}
              {additionalMobileItems.filter(item => item.show !== false).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="pt-2 border-t border-gray-700">
                {!profile ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 p-3 hover:bg-primary-600 rounded-lg transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Register</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="p-3 text-sm text-gray-400">
                      {profile.full_name || profile.email}
                    </div>
                    <div 
                      onTouchStart={(e) => {
                        console.log('Touch start on sign out')
                        e.currentTarget.style.backgroundColor = '#dc2626'
                      }}
                      onTouchEnd={(e) => {
                        console.log('Touch end on sign out')
                        e.currentTarget.style.backgroundColor = ''
                        e.preventDefault()
                        e.stopPropagation()
                        handleSignOut()
                      }}
                      onClick={(e) => {
                        console.log('Click on sign out')
                        e.preventDefault()
                        e.stopPropagation()
                        handleSignOut()
                      }}
                      className="flex items-center space-x-3 p-4 hover:bg-red-600 rounded-lg transition-colors w-full text-left text-red-400 hover:text-white border-2 border-red-500 cursor-pointer select-none"
                      style={{ 
                        touchAction: 'manipulation', 
                        minHeight: '48px',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      <LogOut className="h-5 w-5 pointer-events-none" />
                      <span className="pointer-events-none">Sign Out</span>
                    </div>
                    
                    {/* Alternative simple button */}
                    <button
                      onTouchStart={() => {
                        console.log('Alternative button touch start')
                        setTimeout(() => {
                          console.log('Executing sign out after delay')
                          window.location.href = '/'
                        }, 100)
                      }}
                      className="flex items-center space-x-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors w-full text-left text-white mt-2 border-2 border-green-400"
                      type="button"
                      style={{ minHeight: '48px', touchAction: 'manipulation' }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Quick Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop to close menu when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[50] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}