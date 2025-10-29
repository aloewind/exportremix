"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Supply Chain Director",
      company: "TechExport Inc.",
      content: "ExportRemix saved us $45K in the first quarter alone. The AI predictions are incredibly accurate.",
      rating: 5,
      avatar: "SC",
    },
    {
      name: "Michael Rodriguez",
      role: "Logistics Manager",
      company: "Global Freight Solutions",
      content: "The manifest remixing feature is a game-changer. We've reduced compliance errors by 90%.",
      rating: 5,
      avatar: "MR",
    },
    {
      name: "Emily Thompson",
      role: "Operations Lead",
      company: "Pacific Trade Co.",
      content: "Real-time API sync keeps us ahead of policy changes. Absolutely essential for our business.",
      rating: 5,
      avatar: "ET",
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Trusted by <span className="text-primary">Export Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about ExportRemix
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6 space-y-4">
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
