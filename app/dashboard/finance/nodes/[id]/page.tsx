import FinanceNodeDetailPage from './view';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <FinanceNodeDetailPage />;
}
