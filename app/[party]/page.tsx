import PartyDashboard from '@/components/PartyDashboard';

interface Props {
  params: Promise<{ party: string }>;
}

export default async function PartyPage({ params }: Props) {
  const { party } = await params;
  return <PartyDashboard party={party} />;
}
