import SignupForm from "../components/auth/signup-form";
import { Link } from "react-router-dom";

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-6xl space-y-4">
                <SignupForm />
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}