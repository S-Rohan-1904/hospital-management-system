"use client";
import Footer from "@/components/Home/Footer";
import Navbar from "@/components/Home/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/chat-app/chat");
  }, []);
  return (
    <>
      <Navbar />
      <main>
        <div className="flex px-5 pt-16 pb-12 mb-12 lg:px-36 min-h-[calc(100vh-180px)]"></div>
      </main>
      <Footer />
    </>
  );
}
