import { Chat } from "@/components/chat"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">Homework Helper</h1>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Guidance, not answers</span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="container flex-1 px-4 py-8 md:py-12">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Study Smarter, Not Harder</h2>
              <p className="text-muted-foreground">
                Get guidance on your homework without getting direct answers. Learn concepts, receive hints, and develop
                problem-solving skills.
              </p>
            </div>
            <Chat />
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Homework Helper. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">Designed to help you learn, not to do your work for you.</p>
        </div>
      </footer>
    </div>
  )
}

