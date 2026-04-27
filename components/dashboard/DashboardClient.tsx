'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  FileText, 
  Calendar,
  Plus,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { formatRelativeDate } from '@/lib/utils'

interface Module {
  id: string
  code: string
  name: string
  colour: string
  created_at: string
}

interface Note {
  id: string
  title: string
  module_id: string
  updated_at: string
}

interface DashboardClientProps {
  modules: Module[]
  recentNotes: Note[]
  notesCount: number
}

export function DashboardClient({ modules, recentNotes, notesCount }: DashboardClientProps) {
  const greeting = getGreeting()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {greeting}
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to ace your studies? Let&apos;s get started.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">
        {/* Quick Stats - Spans 2 columns */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Your Progress</p>
              <h3 className="text-3xl font-bold text-blue-900">{notesCount}</h3>
              <p className="text-sm text-blue-700 mt-1">Study notes created</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span>Keep up the great work!</span>
          </div>
        </Card>

        {/* Modules Count */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-purple-900">{modules.length}</h3>
          <p className="text-sm text-purple-700 mt-1">Active modules</p>
        </Card>

        {/* Quick Action - Generate Notes */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/generate" className="block h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-amber-900">Generate Notes</h3>
            <p className="text-sm text-amber-700 mt-1">AI-powered study notes</p>
          </Link>
        </Card>

        {/* Modules Bento Grid - Spans 2 columns, 2 rows */}
        <Card className="col-span-1 md:col-span-2 row-span-2 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              Your Modules
            </h2>
            <Link href="/modules/new">
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                New Module
              </Button>
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No modules yet
              </h3>
              <p className="text-gray-600 mb-4 max-w-sm">
                Create your first module to start organizing your study materials
              </p>
              <Link href="/modules/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Module
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {modules.map((module) => (
                <Link
                  key={module.id}
                  href={`/modules/${module.id}`}
                  className="group"
                >
                  <Card className="p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border hover:border-gray-300 bg-white">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: module.colour }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate transition-colors group-hover:text-blue-600">
                          {module.code}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {module.name}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity - Spans 2 columns */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">
                Your recent notes will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {recentNotes.map((note) => {
                const noteModule = modules.find((m) => m.id === note.module_id)
                return (
                  <Link
                    key={note.id}
                    href={`/modules/${note.module_id}/notes/${note.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      {noteModule && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                          style={{ backgroundColor: noteModule.colour }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {note.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {noteModule?.code} • {formatRelativeDate(note.updated_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/merge" className="block h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-900">Merge PDFs</h3>
            <p className="text-sm text-green-700 mt-1">Combine lecture slides</p>
          </Link>
        </Card>

        {/* Calendar Preview */}
        <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100 hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/calendar" className="block h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-rose-100 rounded-lg">
                <Calendar className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-rose-900">Calendar</h3>
            <p className="text-sm text-rose-700 mt-1">View upcoming events</p>
          </Link>
        </Card>
      </div>

      {/* Study Tip */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">💡 Study Tip of the Day</h3>
            <p className="text-gray-700">
              Break your study sessions into 25-minute focused blocks (Pomodoro Technique) for better retention and less burnout.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning! ☀️'
  if (hour < 18) return 'Good afternoon! 👋'
  return 'Good evening! 🌙'
}
