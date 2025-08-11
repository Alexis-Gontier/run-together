export default function AuthLayout({ children } : { children: React.ReactNode }) {
    return (
        <div className="max-w-sm mx-auto flex flex-col items-center justify-center min-h-screen">
            {children}
        </div>
    );
}