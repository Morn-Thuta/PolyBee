'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { DeleteModuleButton } from '@/components/modules/DeleteModuleButton'
import { formatRelativeDate } from '@/lib/utils'

interface ModuleCardProps {
  module: {
    id: string
    code: string
    name: string
    colour: string
    note_count: number
    last_updated: string
  }
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Colour Dot */}
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: module.colour }}
            />
            <div className="flex-1 min-w-0">
              {/* Module Code */}
              <Link href={`/modules/${module.id}`}>
                <h3 className="font-semibold text-lg leading-tight truncate hover:underline cursor-pointer">
                  {module.code}
                </h3>
              </Link>
              {/* Module Name */}
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {module.name}
              </p>
            </div>
          </div>
          
          {/* Delete Button */}
          <DeleteModuleButton
            moduleId={module.id}
            moduleCode={module.code}
            moduleName={module.name}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {/* Note Count */}
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>
              {module.note_count}{' '}
              {module.note_count === 1 ? 'note' : 'notes'}
            </span>
          </div>
          {/* Last Updated */}
          <span className="text-xs">
            {formatRelativeDate(module.last_updated)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
