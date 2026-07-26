import siteConfig from "@/data/site-config.json";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container column">
          <h1>{siteConfig.coreValueProp}</h1>
          <p>{siteConfig.siteDescription}</p>
        </div>
      </section>
    </>
  );
}
