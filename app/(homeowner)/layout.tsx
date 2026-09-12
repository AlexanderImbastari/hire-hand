import { RoleLayout } from '@/components/RoleLayout';

/** Everything under this group is homeowner-only. */
export default function HomeownerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout role="user">{children}</RoleLayout>;
}
