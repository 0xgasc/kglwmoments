'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plane, Menu, X, Home, User, Calendar, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabase'

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
}

export function MobileNav({ title = 'FlyInGuate', showBackButton = false, customActions }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { profile } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Force page reload to ensure auth state is cleared
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: still redirect even if signOut fails
      window.location.href = '/'
    }
    setIsOpen(false)
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
            {customActions}
            
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
          <div className="absolute top-full left-0 right-0 bg-luxury-black border-t border-gray-700 md:hidden z-50">
            <div className="p-4 space-y-2">
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
              
              {!profile ? (
                <div className="pt-2 border-t border-gray-700">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-700">
                  <div className="p-3 text-sm text-gray-400">
                    {profile.full_name || profile.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 p-3 hover:bg-red-600 rounded-lg transition-colors w-full text-left text-red-400 hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop to close menu when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}