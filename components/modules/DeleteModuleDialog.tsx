'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface DeleteModuleDialogProps {
  moduleId: string
  moduleCode: string
  moduleName: string
  onDelete?: () => void
}

export function DeleteModuleDialog({
  moduleId,
  moduleCode,
  moduleName,
  onDelete,
}: DeleteModuleDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete module')
      }

      toast.success('Module deleted successfully!')
      setIsOpen(false)
      
      // Call onDelete callback if provided
      if (onDelete) {
        onDelete()
      }
      
      // Navigate to modules list and refresh
      router.push('/modules')
      router.refresh()
    } catch (error) {
      console.error('Error deleting module:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete module')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Module</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{moduleCode} - {moduleName}</strong>?
            <br />
            <br />
            This action cannot be undone. All notes and files associated with this module will also be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}