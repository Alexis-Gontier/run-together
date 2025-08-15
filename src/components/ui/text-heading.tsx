type TextHeadingProps = {
    title: string;
    description: string;
};

export default function TextHeading({ title, description }: TextHeadingProps) {

    return (
        <div className="space-y-0">
            <h2
                className="text-2xl font-bold"
            >
                {title}
            </h2>
            <p
                className="text-muted-foreground"
            >
                {description}
            </p>
        </div>
    )
}