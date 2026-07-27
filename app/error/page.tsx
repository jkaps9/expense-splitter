import Header from "@/components/Header";

export default function ErrorPage() {
  return (
    <>
      <Header></Header>
      <main>
        <section className="hero" id="hero">
          <div className="container column">
            <p>Sorry, something went wrong.</p>
          </div>
        </section>
      </main>
    </>
  );
}
