type DashboardTextHeadingProps = {
    title: string;
    description?: string;
};

export function DashboardTextHeading({ title, description }: DashboardTextHeadingProps) {

    return (
        <div className="space-y-0">
            <h2
                className="text-2xl font-bold"
            >
                {title}
            </h2>
            {description && (
                <p
                    className="text-muted-foreground"
                >
                    {description}
                </p>
            )}
        </div>
    )
}