import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export function QuizBreadcrumb({
  crumbs,
  activePath,
}: {
  crumbs: { name: string; href: string }[];
  activePath: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map(({ name, href }) => (
          <>
            <BreadcrumbItem key={name}>
              <BreadcrumbLink asChild>
                <Link href={href}>{name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{activePath}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
