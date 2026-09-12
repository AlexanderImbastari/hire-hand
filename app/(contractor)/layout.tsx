import { RoleLayout } from '@/components/RoleLayout';

/** Everything under this group is contractor-only, and approved-only. */
export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout role="contractor">{children}</RoleLayout>;
}
