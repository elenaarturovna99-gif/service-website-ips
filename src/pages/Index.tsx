import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Process from "@/components/Process";
import Experience from "@/components/Experience";
import Faq from "@/components/Faq";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <WhyUs />
        <Process />
        <Experience />
        <Faq />
        <Contacts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
