"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ExternalLink, Youtube } from "lucide-react"

interface Video {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
}

interface VideoRecommendationsProps {
  topics: string[]
}

export function VideoRecommendations({ topics }: VideoRecommendationsProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchVideos = async () => {
      if (topics.length === 0) return

      setLoading(true)
      try {
        const response = await fetch("/api/youtube-recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topics }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch video recommendations")
        }

        const data = await response.json()
        setVideos(data.videos)
      } catch (error) {
        console.error("Error fetching videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [topics])

  if (videos.length === 0 && !loading) return null

  return (
    <Card className="p-4">
      <div className="flex items-center mb-3">
        <Youtube className="h-5 w-5 text-red-600 mr-2" />
        <h3 className="text-sm font-medium">Recommended Videos</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse space-y-3 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="bg-muted rounded h-16 w-28"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex space-x-3 hover:bg-muted p-2 rounded-md transition-colors"
            >
              <div className="relative h-16 w-28 flex-shrink-0">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="object-cover rounded-md h-full w-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2">{video.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                <div className="flex items-center mt-1 text-xs text-primary">
                  <span>Watch</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}

