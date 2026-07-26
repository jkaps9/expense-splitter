import siteConfig from "@/data/site-config.json";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header></Header>
      <main>
        <section className="hero" id="hero">
          <div className="container column">
            <h1>{siteConfig.coreValueProp}</h1>
            <p>{siteConfig.siteDescription}</p>
          </div>
        </section>
      </main>
    </>
  );
}
