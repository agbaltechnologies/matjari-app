import NewFinanceAccountPage from './view';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <NewFinanceAccountPage />;
}
