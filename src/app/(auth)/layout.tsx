export default function AuthLayout({ children } : { children: React.ReactNode }) {
    return (
        <div className="max-w-md mx-auto px-6 flex flex-col items-center justify-center min-h-screen">
            {children}
        </div>
    );
}