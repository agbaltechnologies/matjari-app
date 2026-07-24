import EditFinanceNodePage from './view';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <EditFinanceNodePage />;
}
