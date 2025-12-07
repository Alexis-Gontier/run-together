import { Button } from "@/components/shadcn-ui/button"

export function PublicHero() {
    return (
        <section className="h-130 flex flex-col justify-center items-center gap-6">
            <h1 className="flex flex-col items-center text-center text-7xl">
                <span>Build in a weekend</span>
                <span className="text-primary">Scale to millions</span>
            </h1>
            <p className="max-w-2xl text-center text-lg flex flex-col">
                <span>Supabase is the Postgres development platform.</span>
                <span>Start your project with a Postgres database, Authentication, instant APIs, Edge Functions, Realtime subscriptions, Storage, and Vector embeddings.</span>
            </p>
            <div className="space-x-2">
                <Button variant="default" size="lg">Start your project</Button>
                <Button variant="outline" size="lg">Request a demo</Button>
            </div>
        </section>
    )
}
