import * as React from "react"
import { cn } from "@/lib/utils"

export interface ImageGridProps {
  images: string[]
  alt?: string
}

export function ImageGrid({ images, alt = "" }: ImageGridProps) {
  if (!images || images.length === 0) return null

  const count = images.length

  // 单张大图
  if (count === 1) {
    return (
      <div className="mt-3 rounded-lg overflow-hidden">
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-auto max-h-96 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
    )
  }

  // 两张并排
  if (count === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <img
              src={img}
              alt={`${alt} ${i + 1}/${count}`}
              className="w-full h-48 object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        ))}
      </div>
    )
  }

  // 3-4 张：网格布局
  if (count <= 4) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <img
              src={img}
              alt={`${alt} ${i + 1}/${count}`}
              className="w-full h-32 object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        ))}
      </div>
    )
  }

  // 5+ 张：前 4 张 + 更多按钮
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {images.slice(0, 5).map((img, i) => (
        <div
          key={i}
          className={cn(
            "rounded-lg overflow-hidden relative",
            i === 4 && "bg-muted flex items-center justify-center"
          )}
        >
          {i === 4 ? (
            <div className="w-full h-24 flex items-center justify-center text-muted-foreground font-medium">
              +{count - 4}
            </div>
          ) : (
            <img
              src={img}
              alt={`${alt} ${i + 1}/${count}`}
              className="w-full h-24 object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
