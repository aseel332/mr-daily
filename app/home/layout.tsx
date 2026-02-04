import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/add-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
  
      <main className="w-full">
    
        {children}
      </main>

  )
}