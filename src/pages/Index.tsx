import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Process from "@/components/Process";
import Experience from "@/components/Experience";
import Faq from "@/components/Faq";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/i18n/LanguageContext";
import ru from "@/i18n/ru";
import { faqSchema, setJsonLd } from "@/lib/jsonld";

const Index = () => {
  useEffect(() => setJsonLd("ld-faq", faqSchema(ru.faq.items)), []);

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
};

export default Index;