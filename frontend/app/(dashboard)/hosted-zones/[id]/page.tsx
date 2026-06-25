import { HostedZoneDetailPage } from "@/features/hosted-zones/hosted-zone-detail-page";

export const metadata = {
  title: "Hosted Zone Details — Route 53 — AWS Management Console",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function HostedZoneDetail({ params }: PageProps) {
  const { id } = await params;
  return <HostedZoneDetailPage zoneId={Number(id)} />;
}
