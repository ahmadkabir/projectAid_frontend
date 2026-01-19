import Navbar from './Navbar';
import Footer from './Footer';

const PageLayout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Add padding-top to account for fixed navbar (64px = h-16) */}
      <main className="flex-grow pt-20">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
