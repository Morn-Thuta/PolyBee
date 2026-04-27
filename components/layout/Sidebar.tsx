'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sparkles, Merge, Calendar, Plus, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Module } from '@/supabase/types'

interface SidebarProps {
  modules: Module[]
}

export function Sidebar({ modules }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/generate', label: 'Generate', icon: Sparkles },
    { href: '/merge', label: 'Merge Files', icon: Merge },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl">PolyBee</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="px-3 py-4 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* My Modules Section */}
      <div className="px-3 py-4 flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-3 mb-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            My Modules
          </h2>
        </div>
        <div className="space-y-1">
          {modules.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No modules yet
            </p>
          ) : (
            modules.map((module) => {
              const moduleActive = pathname.startsWith(`/modules/${module.id}`)
              return (
                <Link
                  key={module.id}
                  href={`/modules/${module.id}`}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    moduleActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: module.colour }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{module.code}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {module.name}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* New Module Button */}
      <div className="px-3 py-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href="/modules/new" onClick={() => setIsMobileOpen(false)}>
            <Plus className="w-4 h-4" />
            New Module
          </Link>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border shadow-sm"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-background border-r flex flex-col z-40 transition-transform duration-200',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
