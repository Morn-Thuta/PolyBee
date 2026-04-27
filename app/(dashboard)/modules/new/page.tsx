import { ModuleCreateForm } from '@/components/modules/ModuleCreateForm'

export default function NewModulePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Create New Module</h1>
      <p className="text-muted-foreground mb-6">
        Add a new module to organize your notes, files, and calendar events.
      </p>
      <div className="bg-card border rounded-lg p-6">
        <ModuleCreateForm />
      </div>
    </div>
  )
}
