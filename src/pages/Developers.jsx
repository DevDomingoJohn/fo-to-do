const developers = [
  {
    name: 'John Lery Domingo',
    role: '',
    description: "The lead developer and full-stack developer for fo-to-do. He is experienced in android development and has a background in scripting and web development.",
  },
  {
    name: 'Mary Clarence Reotan',
    role: '',
    description: "I'm passionate about learning new technologies, improving my skills, and exploring the world of web development and IT.",
  },
  {
    name: 'Mica Graciella Dequina',
    role: '',
    description: "BSIT student aspiring to become a IT professional, with interests in database management, and computer networking. Eager to explore new technologies, expand technical knowledge, and develop practical IT skills.",
  },
  {
    name: 'Kristine Rose Amistoso',
    role: '',
    description: "I enjoy turning ideas into reality through coding and creating simple, meaningful web experiences. Every project is an opportunity to learn something new and grow as an aspiring IT professional.",
  },
]

function Developers() {
  return (
    <section className="py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="eyebrow">THE PEOPLE BEHIND THE PROJECT</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Meet the developers</h1>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Get to know the four people behind fo-to-do.
          </p>
        </div>
      </header>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {developers.map((dev) => (
          <article
            key={dev.name}
            className="group relative overflow-hidden rounded-xl border border-line bg-panel p-5 transition duration-200 hover:border-[#555b55]"
          >
            <h2 className="text-lg font-semibold text-ink">{dev.name}</h2>
            <p className="mt-1 text-sm font-medium text-accent">{dev.role}</p>
            <p className="mt-4 text-sm leading-6 text-muted">{dev.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Developers
