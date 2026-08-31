import { Sidebar } from '@/components/Sidebar'
import { ChatPanel } from '@/components/ChatPanel'

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-lg font-semibold">Command Center</h1>
        <div className="h-[70vh]">
          <ChatPanel />
        </div>
      </main>
    </div>
  )
}
