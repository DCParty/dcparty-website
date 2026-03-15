import { Navbar } from "@/components/dcfilms/Navbar";
import { Footer } from "@/components/dcfilms/Footer";
import { ContactForm } from "@/components/dcfilms/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "聯絡 DC Films。無論是高規格的實拍商業廣告、動畫製作，或是需要我們為您規劃精準的製作方案。",
};

export default function ContactPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="pt-48 pb-32 px-8 md:px-16 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <h1 className="text-6xl md:text-8xl font-serif text-white italic mb-8">Contact.</h1>
            <p className="text-zinc-400 font-light leading-relaxed mb-16 max-w-md text-lg">
              無論是高規格的實拍商業廣告、動畫製作，或是需要我們為您規劃精準的製作方案，請與我們聯繫。
            </p>
            <div className="space-y-12 border-t border-white/10 pt-12">
              <div>
                <h4 className="text-xs text-zinc-600 tracking-widest uppercase mb-3 font-semibold">General Inquiries</h4>
                <a href="mailto:hello@dcfilms.tv" className="text-white text-xl font-serif hover:text-zinc-400 transition-colors">hello@dcfilms.tv</a>
              </div>
              <div>
                <h4 className="text-xs text-zinc-600 tracking-widest uppercase mb-3 font-semibold">Phone</h4>
                <a href="tel:+886227290939" className="text-white text-lg font-serif hover:text-zinc-400 transition-colors">02-2729-0939</a>
              </div>
              <div>
                <h4 className="text-xs text-zinc-600 tracking-widest uppercase mb-3 font-semibold">Studio Location</h4>
                <p className="text-white text-lg font-serif">114 台北市內湖區<br />新湖二路166號2F</p>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
