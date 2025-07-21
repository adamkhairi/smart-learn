import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    splitLayout?: boolean;
    isRegisterPage?: boolean;
}

export default function AuthLayout({
    children,
    title,
    description,
    splitLayout = false,
    isRegisterPage = false,
    ...props
}: AuthLayoutProps) {
    const LayoutComponent = splitLayout ? AuthSplitLayout : AuthSimpleLayout;

    return (
        <LayoutComponent title={title} description={description} isRegisterPage={isRegisterPage} {...props}>
            {children}
        </LayoutComponent>
    );
}
