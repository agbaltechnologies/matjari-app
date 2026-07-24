import NewFinanceRevenuePage from './view';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <NewFinanceRevenuePage />;
}
