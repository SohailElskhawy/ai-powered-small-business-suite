import Link from "next/link"
import { Home, Users, Package, FileText } from "lucide-react"

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Customers",
        url: "/customers",
        icon: Users,
    },
    {
        title: "Products",
        url: "/products",
        icon: Package,
    },
    {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
    },
]

export function AppSidebar() {
    return (
        <div className="flex flex-col h-full">
            <nav className="flex-1 p-4 space-y-2">
                {items.map((item) => (
                    <Link
                        key={item.title}
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}