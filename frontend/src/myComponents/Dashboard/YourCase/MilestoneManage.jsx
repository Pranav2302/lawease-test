
import { useState } from "react"
import { Bell, CheckCircle, Clock, XCircle, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Sample data for milestones
const initialMilestones = [
  {
    id: 1,
    title: "Case Creation",
    description: "User submits a legal case with necessary details and documents.",
    status: "Completed",
    payment: 500,
    comments: "Case successfully created and assigned to a legal expert.",
  },
  {
    id: 2,
    title: "Legal Service Provider Assignment",
    description: "System assigns a verified legal professional to the case.",
    status: "Completed",
    payment: 1000,
    comments: "Advocate assigned and client notified.",
  },
  {
    id: 3,
    title: "Initial Consultation",
    description: "First interaction between client and legal expert.",
    status: "Pending",
    payment: 1500,
    comments: "Awaiting client availability for consultation.",
  },
  {
    id: 4,
    title: "Case Review & Document Verification",
    description: "Legal expert reviews submitted documents for accuracy and validity.",
    status: "Pending",
    payment: 1500,
    comments: "",
  },
  {
    id: 5,
    title: "Drafting Legal Documents",
    description: "Preparation of legal drafts, contracts, or petitions.",
    status: "Rejected",
    payment: 800,
    comments: "Draft requires revision due to missing details.",
  },
  {
    id: 6,
    title: "Court Filing & Proceedings",
    description: "Case is filed in court and initial hearing date is set.",
    status: "Pending",
    payment: 2000,
    comments: "",
  },
  {
    id: 7,
    title: "Case Resolution & Closure",
    description: "Final case resolution with legal outcome or settlement.",
    status: "Pending",
    payment: 2500,
    comments: "Awaiting final judgment or agreement.",
  },
];



export default function MilestoneManage() {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    payment: "",
  })

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (milestones.filter((m) => m.status === "Completed").length / milestones.length) * 100,
  )

  // Handle request approval
  const handleRequestApproval = (milestone) => {
    setSelectedMilestone(milestone)
    setDialogType("request")
    setIsDialogOpen(true)
  }

  // Handle complete milestone
  const handleCompleteMilestone = (milestone) => {
    setSelectedMilestone(milestone)
    setDialogType("complete")
    setIsDialogOpen(true)
  }

  // Handle reject milestone
  const handleRejectMilestone = (milestone) => {
    setSelectedMilestone(milestone)
    setDialogType("reject")
    setIsDialogOpen(true)
  }

  // Handle add milestone
  const handleAddMilestone = () => {
    setDialogType("add")
    setIsDialogOpen(true)
  }

  // Handle new milestone input change
  const handleNewMilestoneChange = (e) => {
    const { name, value } = e.target
    setNewMilestone({
      ...newMilestone,
      [name]: value,
    })
  }

  // Submit dialog action
  const handleDialogSubmit = () => {
    if (dialogType === "request") {
      // In a real app, this would send a request to the server
      alert(`Approval requested for milestone: ${selectedMilestone.title}`)
    } else if (dialogType === "complete") {
      // Update milestone status
      setMilestones(milestones.map((m) => (m.id === selectedMilestone.id ? { ...m, status: "Completed" } : m)))
    } else if (dialogType === "reject") {
      // Update milestone status
      setMilestones(milestones.map((m) => (m.id === selectedMilestone.id ? { ...m, status: "Rejected" } : m)))
    } else if (dialogType === "add") {
      // Add new milestone
      const newId = Math.max(...milestones.map((m) => m.id)) + 1
      const milestoneToAdd = {
        id: newId,
        title: newMilestone.title,
        description: newMilestone.description,
        status: "Pending",
        payment: Number.parseFloat(newMilestone.payment) || 0,
        comments: "",
      }
      setMilestones([...milestones, milestoneToAdd])
      setNewMilestone({ title: "", description: "", payment: "" })
    }
    setIsDialogOpen(false)
  }

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-black text-white hover:bg-black/80">
            <CheckCircle className="w-3 h-3 mr-1" /> {status}
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> {status}
          </Badge>
        )
      case "Pending":
        return (
          <Badge variant="outline" className="border-black text-black">
            <Clock className="w-3 h-3 mr-1" /> {status}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6 border-black/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Milestone Management</CardTitle>
              <CardDescription>Track and manage project milestones</CardDescription>
            </div>
            <Button variant="outline" size="icon" className="border-black/20">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Project Completion</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2 bg-gray-200" indicatorClassName="bg-black" />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((milestone) => (
                  <TableRow key={milestone.id}>
                    <TableCell className="font-bold">{milestone.id}</TableCell>
                    <TableCell className="font-medium">{milestone.title}</TableCell>
                    <TableCell>{milestone.description}</TableCell>
                    <TableCell>₹{milestone.payment.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {milestone.status === "Pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRequestApproval(milestone)}
                              className="border-black/20 hover:bg-black/5"
                            >
                              Request
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCompleteMilestone(milestone)}
                              className="bg-black text-white hover:bg-black/80"
                            >
                              Complete
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleRejectMilestone(milestone)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAddMilestone} className="bg-black text-white hover:bg-black/80">
            <Plus className="mr-2 h-4 w-4" /> Add Milestone
          </Button>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Milestone Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Completed</span>
                <Badge variant="outline" className="bg-black/10 text-black hover:bg-black/10">
                  {milestones.filter((m) => m.status === "Completed").length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <Badge variant="outline" className="bg-gray-100 text-black hover:bg-gray-100">
                  {milestones.filter((m) => m.status === "Pending").length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Rejected</span>
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                  {milestones.filter((m) => m.status === "Rejected").length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-black pl-4 py-1">
                <p className="font-medium">Design Phase completed</p>
                <p className="text-sm text-muted-foreground">2 days ago</p>
              </div>
              <div className="border-l-2 border-red-500 pl-4 py-1">
                <p className="font-medium">Testing Phase rejected</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
              <div className="border-l-2 border-gray-500 pl-4 py-1">
                <p className="font-medium">Development Sprint 1 submitted for approval</p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for milestone actions */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "request" && "Request Approval"}
              {dialogType === "complete" && "Complete Milestone"}
              {dialogType === "reject" && "Reject Milestone"}
              {dialogType === "add" && "Add New Milestone"}
            </DialogTitle>
            <DialogDescription>
              {selectedMilestone && dialogType !== "add" && (
                <span>
                  {dialogType === "request" && `Request approval for milestone: ${selectedMilestone.title}`}
                  {dialogType === "complete" && `Are you sure you want to complete: ${selectedMilestone.title}?`}
                  {dialogType === "reject" && `Are you sure you want to reject: ${selectedMilestone.title}?`}
                </span>
              )}
              {dialogType === "add" && "Add a new milestone to the project"}
            </DialogDescription>
          </DialogHeader>

          {dialogType === "add" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Milestone Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newMilestone.title}
                  onChange={handleNewMilestoneChange}
                  className="border-black/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newMilestone.description}
                  onChange={handleNewMilestoneChange}
                  className="border-black/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment">Payment Amount (₹)</Label>
                <Input
                  id="payment"
                  name="payment"
                  type="number"
                  value={newMilestone.payment}
                  onChange={handleNewMilestoneChange}
                  className="border-black/20"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-black/20">
              Cancel
            </Button>
            <Button
              onClick={handleDialogSubmit}
              variant={dialogType === "reject" ? "destructive" : "default"}
              className={dialogType !== "reject" ? "bg-black text-white hover:bg-black/80" : ""}
            >
              {dialogType === "request" && "Submit Request"}
              {dialogType === "complete" && "Complete"}
              {dialogType === "reject" && "Reject"}
              {dialogType === "add" && "Add Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

