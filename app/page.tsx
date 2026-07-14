import Image from "next/image";
import styles from "./page.module.css";
import siteConfig from "@/data/site-config.json";

export default function Home() {
  return (
    <section className="hero">
      <div className="container">
        <h1>{siteConfig.siteName}</h1>
        <p>{siteConfig.siteDescription}</p>
      </div>
    </section>
  );
}
