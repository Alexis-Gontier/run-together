import { env } from "@/utils/env"
import { notFound } from "next/navigation"

export default async function TestPage() {

    if (env.NODE_ENV !== "development") {
        notFound()
    }

    return (
        <div>
            Page test
        </div>
    )
}
