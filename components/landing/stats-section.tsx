"use client"

export function StatsSection() {
  const stats = [
    {
      value: "76%",
      label: "of delays from bad data",
      description: "Industry research shows most customs delays are preventable",
    },
    {
      value: "$1.5B",
      label: "lost annually",
      description: "US businesses lose billions to export compliance issues",
    },
    {
      value: "ExportRemix",
      label: "fixes it",
      description: "AI-powered solution that eliminates data errors",
    },
  ]

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">The Export Crisis</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            The problem is real, costly, and growing. But there's a solution.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
              <div className="text-xl font-semibold">{stat.label}</div>
              <p className="text-sm opacity-80">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
