import { HostedZoneDetailPage } from "@/features/hosted-zones/hosted-zone-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecordsPage({ params }: PageProps) {
  const { id } = await params;
  return <HostedZoneDetailPage zoneId={Number(id)} />;
}
