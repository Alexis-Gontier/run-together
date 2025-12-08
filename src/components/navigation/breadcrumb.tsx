"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Breadcrumb as BreadcrumbComponent,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator
} from "@/components/shadcn-ui/breadcrumb";

export function Breadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    const filteredSegments = segments[0] === 'dashboard' ? segments.slice(1) : segments;

    return (
        <BreadcrumbComponent>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">
                            Accueil
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {filteredSegments.map((segment, idx) => {
                    const href = '/dashboard/' + filteredSegments.slice(0, idx + 1).join('/');
                    const isLast = idx === filteredSegments.length - 1;
                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator>
                                {/* <SlashIcon /> */}
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <span className="text-muted-foreground capitalize">{decodeURIComponent(segment)}</span>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={href} className="capitalize">{decodeURIComponent(segment)}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </BreadcrumbComponent>
    );
}