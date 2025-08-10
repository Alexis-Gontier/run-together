import { env } from "@/utils/env"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function TestPage() {

    // if (env.NODE_ENV !== "development") {
    //     notFound()
    // }

    const defaults = await prisma.default.findMany();

    return (
        <div>
            <pre>
                <code>
                    {JSON.stringify(defaults, null, 2)}
                </code>
            </pre>
        </div>
    )
}
