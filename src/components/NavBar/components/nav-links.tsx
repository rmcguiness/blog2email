'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ label, href, }: { label: string, href: string }) {
    const pathname = usePathname();
    return (
        <Link href={href}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === href
                ? 'border-navy-500 text-gray-900'
                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700'
                }`}
        >
            {label}
        </Link>
    );
}