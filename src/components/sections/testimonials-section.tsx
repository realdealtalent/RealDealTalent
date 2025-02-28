
import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialProps } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
  testimonials: TestimonialProps[]
  className?: string
}

export function TestimonialsSection({ 
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "bg-background text-foreground",
      "py-12",
      className
    )}>
      <div className="mx-auto flex max-w-container flex-col items-center">
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:80s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                    className="shadow-[0_0_15px_rgba(66,153,225,0.3)] hover:shadow-[0_0_25px_rgba(66,153,225,0.5)] transition-shadow duration-300"
                  />
                ))
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  )
}
