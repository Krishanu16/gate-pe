import { Outlet } from '@tanstack/react-router';
import { Header } from './Header'; // This matches the Named Export above
import Footer from './Footer';
import { SecurityLayer } from './SecurityLayer';

export default function Layout() {
  return (
    <SecurityLayer>
      <div className="min-h-screen flex flex-col grid-background">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SecurityLayer>
  );
}