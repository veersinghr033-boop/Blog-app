import MainLayout from "@/components/ui/MainLayout"


export default function Layout({ children }: { children: React.ReactNode }) {
    return <MainLayout >{children}</MainLayout>
}