
import { useState } from "react"
import { Award, Calendar, ChevronDown, Filter, Moon, Star, Sun, Trophy, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for the leaderboard
const topLawyers = [
  {
    id: 1,
    name: "Suraj Kumar",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgPZE_LOqt3pg8ds9UwTFhU80B7XpcosFYTQ&s",
    specialty: "Corporate Law",
    winRate: 92,
    clientSatisfaction: 4.9,
    casesCompleted: 145,
    revenue: 850000,
    rank: 1,
  },
  {
    id: 2,
    name: "Rahul Sharma",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAlqFotKhHtRCqSJxAKWVm1qFulsiOtU2ZZg&s",
    specialty: "Intellectual Property",
    winRate: 89,
    clientSatisfaction: 4.8,
    casesCompleted: 132,
    revenue: 780000,
    rank: 2,
  },
  {
    id: 3,
    name: "Priyansh Patel",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7AloJFVQf4Vae-gGD1D5vxzp7Go7vtdoklQ&s",
    specialty: "Criminal Defense",
    winRate: 87,
    clientSatisfaction: 4.7,
    casesCompleted: 156,
    revenue: 720000,
    rank: 3,
  },
  // Current user
  {
    id: 4,
    name: "You (Pranav Kamble)",
    avatar: "/placeholder.svg?height=80&width=80",
    specialty: "Family Law",
    winRate: 82,
    clientSatisfaction: 4.5,
    casesCompleted: 98,
    revenue: 620000,
    rank: 7,
    isCurrentUser: true,
  },
]

const performanceMetrics = [
  { name: "Win Rate", you: 82, top1: 92, top2: 89, top3: 87 },
  { name: "Client Rating", you: 4.5, top1: 4.9, top2: 4.8, top3: 4.7 },
  { name: "Cases Completed", you: 98, top1: 145, top2: 132, top3: 156 },
  { name: "Revenue (K)", you: 620, top1: 850, top2: 780, top3: 720 },
]

const specialties = [
  "All Specialties",
  "Corporate Law",
  "Criminal Defense",
  "Family Law",
  "Intellectual Property",
  "Personal Injury",
  "Real Estate",
  "Tax Law",
]

export default function Leaderboard() {
  const [period, setPeriod] = useState("monthly")
  const [specialty, setSpecialty] = useState("All Specialties")
  const [sortBy, setSortBy] = useState("rank")

  // Filter and sort lawyers based on selected criteria
  const filteredLawyers = topLawyers
    .filter((lawyer) => specialty === "All Specialties" || lawyer.specialty === specialty)
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank
      if (sortBy === "winRate") return b.winRate - a.winRate
      if (sortBy === "clientSatisfaction") return b.clientSatisfaction - a.clientSatisfaction
      if (sortBy === "casesCompleted") return b.casesCompleted - a.casesCompleted
      if (sortBy === "revenue") return b.revenue - a.revenue
      return 0
    })

  // Find current user's rank in the filtered list
  const currentUserRank = filteredLawyers.findIndex((lawyer) => lawyer.isCurrentUser) + 1

  return (
    <div className="w-full flex items-centerc justify-center">
      <div className="flex min-h-screen  flex-col bg-white dark:bg-gray-950 mt-16 w-11/12">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 dark:bg-gray-950 dark:border-gray-800">
        <h1 className="text-lg font-semibold md:text-2xl dark:text-white">Legal Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Case Types</span>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline-block">Filter by Date</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPeriod("weekly")}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("monthly")}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("quarterly")}>This Quarter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("yearly")}>This Year</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Custom Range</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={() => document.documentElement.classList.toggle("dark")}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight dark:text-white">Lawyer Leaderboard</h2>
            <p className="text-muted-foreground dark:text-gray-400">
              Compare your performance with top lawyers in your field
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="winRate">Win Rate</SelectItem>
                  <SelectItem value="clientSatisfaction">Client Satisfaction</SelectItem>
                  <SelectItem value="casesCompleted">Cases Completed</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Top 3 Lawyers */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {filteredLawyers.slice(0, 3).map((lawyer, index) => (
            <Card
              key={lawyer.id}
              className={`overflow-hidden ${lawyer.isCurrentUser ? "border-2 border-black dark:border-white" : ""}`}
            >
              <CardHeader className="relative pb-0">
                <div className="absolute right-4 top-4">
                  {index === 0 ? (
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  ) : index === 1 ? (
                    <Trophy className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Trophy className="h-6 w-6 text-amber-700" />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                      <img
                        src={lawyer.avatar || "/placeholder.svg"}
                        alt={lawyer.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                      {lawyer.rank}
                    </div>
                  </div>
                  <CardTitle className="text-center dark:text-white">{lawyer.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {lawyer.specialty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Win Rate</span>
                    <span className="text-xl font-bold dark:text-white">{lawyer.winRate}%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Satisfaction</span>
                    <div className="flex items-center">
                      <span className="text-xl font-bold dark:text-white">{lawyer.clientSatisfaction}</span>
                      <Star className="ml-1 h-4 w-4 fill-current text-black dark:text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Cases</span>
                    <span className="text-xl font-bold dark:text-white">{lawyer.casesCompleted}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Revenue</span>
                    <span className="text-xl font-bold dark:text-white">₹
                    {(lawyer.revenue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </CardContent>
              {lawyer.isCurrentUser && (
                <CardFooter className="bg-gray-100 py-2 text-center dark:bg-gray-800">
                  <span className="w-full text-sm font-medium dark:text-white">This is you</span>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {/* Your Ranking */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="dark:text-white">Your Performance</CardTitle>
            <CardDescription>How you compare to the top performers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center justify-between rounded-lg border p-4 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                  <span className="text-xl font-bold">{currentUserRank}</span>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Your Current Rank</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    {currentUserRank === 1
                      ? "You're at the top! Keep up the great work."
                      : `You're ${currentUserRank - 1} ${currentUserRank - 1 === 1 ? "position" : "positions"} away from the top.`}
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <Button variant="outline">View Detailed Stats</Button>
              </div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" stroke="#333" className="dark:text-white" />
                  <YAxis stroke="#333" className="dark:text-white" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <p className="font-medium dark:text-white">{label}</p>
                            <div className="mt-1 grid gap-1">
                              {payload.map((entry) => (
                                <div key={entry.dataKey} className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-sm dark:text-gray-300">
                                    {entry.name}: {entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="you" fill="#000000" name="You" />
                  <Bar dataKey="top1" fill="#FFD700" name="1st Place" />
                  <Bar dataKey="top2" fill="#C0C0C0" name="2nd Place" />
                  <Bar dataKey="top3" fill="#CD7F32" name="3rd Place" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Improvement Suggestions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="dark:text-white">Improvement Opportunities</CardTitle>
            <CardDescription>Areas where you can improve to climb the rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <div className="mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <h3 className="font-medium dark:text-white">Win Rate</h3>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Your win rate is 10% lower than the top performer. Focus on case preparation and evidence gathering.
                </p>
              </div>
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <div className="mb-2 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <h3 className="font-medium dark:text-white">Client Satisfaction</h3>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Improve client communication and set clear expectations to boost your satisfaction ratings.
                </p>
              </div>
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h3 className="font-medium dark:text-white">Case Volume</h3>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Consider taking on more cases or optimizing your workflow to handle more clients efficiently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    </div>
  )
}

