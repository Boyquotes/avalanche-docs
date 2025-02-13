"use client"

import { useState, useEffect, useMemo } from "react"
import { GitCommit, Users, GitFork, Github } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface APIResponse {
  metadata: {
    queriedDays: number
    repositoriesChecked: number
    dateRange: {
      start: string
      end: string
    }
    totalCommitsFetched: number
    contributors: {
      total: number
    }
  }
  data: Array<{
    date: string
    totalCommits: number
    uniqueAuthors: string[]
    repositories: string[]
    repoStats: Record<string, {
      commits: number
      authors: string[]
    }>
  }>
}

interface DayData {
  date: string
  commits: number
  authors: string[]
  repos: string[]
  intensity: number
}

export default function ActivityGrid() {
  const [data, setData] = useState<APIResponse["data"]>([])
  const [metadata, setMetadata] = useState<APIResponse["metadata"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch('/github_activity.json')
        if (!response.ok) throw new Error("Failed to load activity data")
        const result: APIResponse = await response.json()
        console.log('Loaded data:', result)
        setData(result.data || [])
        setMetadata(result.metadata || null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred loading activity data"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const { weeks, maxCommits } = useMemo(() => {
    const today = new Date()
    const dates = Array.from({ length: 180 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (179 - i))
      return date.toISOString().split("T")[0]
    })

    const commitMap: Record<string, { commits: number; authors: string[]; repos: string[] }> = {}
    if (Array.isArray(data)) {
      data.forEach((day) => {
        commitMap[day.date] = {
          commits: day.totalCommits || 0,
          authors: day.uniqueAuthors || [],
          repos: day.repositories || [],
        }
      })
    }

    const maxCommits = Math.max(1, ...Object.values(commitMap).map((d) => d.commits))

    const weeks: DayData[][] = []
    let currentWeek: DayData[] = []
    let weekStartDate = new Date(dates[0])
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay())

    while (weekStartDate < new Date(dates[0])) {
      currentWeek.push({
        date: weekStartDate.toISOString().split("T")[0],
        commits: 0,
        authors: [],
        repos: [],
        intensity: 0
      })
      weekStartDate.setDate(weekStartDate.getDate() + 1)
    }

    dates.forEach((date) => {
      const dayData = commitMap[date] || { commits: 0, authors: [], repos: [] }
      currentWeek.push({
        date,
        commits: dayData.commits,
        authors: dayData.authors,
        repos: dayData.repos,
        intensity: Math.ceil((dayData.commits / maxCommits) * 4),
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      const remainingDays = 7 - currentWeek.length
      const lastDate = new Date(currentWeek[currentWeek.length - 1].date)
      
      for (let i = 1; i <= remainingDays; i++) {
        lastDate.setDate(lastDate.getDate() + 1)
        currentWeek.push({
          date: lastDate.toISOString().split("T")[0],
          commits: 0,
          authors: [],
          repos: [],
          intensity: 0
        })
      }
      weeks.push(currentWeek)
    }

    return { weeks, maxCommits }
  }, [data])

  const getBackgroundColor = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return "bg-sky-50"
      case 1:
        return "bg-sky-100"
      case 2:
        return "bg-sky-200"
      case 3:
        return "bg-sky-300"
      case 4:
        return "bg-sky-400"
      default:
        return "bg-transparent border border-gray-200 dark:border-gray-700"
    }
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center px-4">
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center px-4">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <h2 className="font-display text-3xl tracking-tight sm:text-5xl text-center flex items-center gap-3">
        <Github className="w-8 h-8 sm:w-10 sm:h-10" /> Development Activity
      </h2>

      <div className="mt-10 w-full">
        {metadata && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="border-[1.2px] p-6 rounded-lg transform-gpu hover:bg-[#dfe3e8] dark:hover:bg-[#1c1c1c] transition-all duration-300">
              <div className="flex items-center gap-3 text-muted-foreground mb-3">
                <GitCommit className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Total Commits</span>
              </div>
              <div className="text-3xl font-bold">
                {(metadata?.totalCommitsFetched ?? 0).toLocaleString()}
              </div>
            </div>

            <div className="border-[1.2px] p-6 rounded-lg transform-gpu hover:bg-[#dfe3e8] dark:hover:bg-[#1c1c1c] transition-all duration-300">
              <div className="flex items-center gap-3 text-muted-foreground mb-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Contributors</span>
              </div>
              <div className="text-3xl font-bold">
                {(metadata?.contributors?.total ?? 0).toLocaleString()}
              </div>
            </div>

            <div className="border-[1.2px] p-6 rounded-lg transform-gpu hover:bg-[#dfe3e8] dark:hover:bg-[#1c1c1c] transition-all duration-300">
              <div className="flex items-center gap-3 text-muted-foreground mb-3">
                <GitFork className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Repositories</span>
              </div>
              <div className="text-3xl font-bold">
                {(metadata?.repositoriesChecked ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 border-[1.2px] p-6 rounded-lg">
          <TooltipProvider delayDuration={100}>
            <div className="grid grid-flow-col gap-1.5 auto-cols-fr">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid gap-1.5">
                  {week.map((day) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            aspect-square cursor-pointer rounded-sm outline -outline-offset-1 outline-black/10 sm:rounded-md dark:outline-white/10
                            ${getBackgroundColor(day.intensity)}
                          `}
                        />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top"
                        sideOffset={5}
                        className="bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95 rounded-md border-0"
                      >
                        <p className="text-sm whitespace-nowrap">
                          {day.commits} {day.commits === 1 ? 'contribution' : 'contributions'} on {formatDate(new Date(day.date))}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </TooltipProvider>

          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-muted-foreground">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-4 h-4 rounded-sm ${getBackgroundColor(level)}`} />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}