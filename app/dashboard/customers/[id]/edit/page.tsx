import EditCustomerPage from './view';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <EditCustomerPage />;
}
