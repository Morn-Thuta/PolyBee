'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteModuleButtonProps {
  moduleId: string
  moduleCode: string
  moduleName: string
}

export function DeleteModuleButton({
  moduleId,
  moduleCode,
  moduleName,
}: DeleteModuleButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isDeleting) return // Prevent double-clicks
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${moduleCode} - ${moduleName}? This action cannot be undone.`
    )
    
    if (!confirmed) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Use Next.js router for navigation
        router.push('/modules')
        router.refresh() // Force refresh to update the module list
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete module')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete module')
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
}