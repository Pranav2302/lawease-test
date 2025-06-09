
import { useEffect, useState } from "react"
import { getAllCasesWithClients } from "@/services/operations/caseAPI"
import { useSelector } from "react-redux"
import {
  FileText,
  X,
  Download,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  User,
  Folder,
  Calendar,
  Clock,
  Plus,
} from "lucide-react"

// Import the MilestoneManagement component
import MilestoneManagement from "./MilestoneManage"

const CaseYour = () => {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDocViewer, setShowDocViewer] = useState(false)
  const [currentDocUrl, setCurrentDocUrl] = useState("")
  const [currentDocIndex, setCurrentDocIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [activeTab, setActiveTab] = useState("details")

  const token = useSelector((state) => state.auth.token)
  const accountType = useSelector((state) => state.profile.user?.accountType)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true)
        const fetchedCases = await getAllCasesWithClients(token)
        
        // Check if fetchedCases is valid before setting state
        if (fetchedCases && Array.isArray(fetchedCases)) {
          setCases(fetchedCases)

          // If there are cases, select the first one by default
          if (fetchedCases.length > 0) {
            setSelectedCase(fetchedCases[0])
          }
        } else {
          console.error("Invalid cases data received:", fetchedCases)
          setCases([])
        }
      } catch (error) {
        console.error("Error fetching cases:", error)
        setCases([])
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchCases()
    }
  }, [token])

  const handleCardClick = (caseItem) => {
    setSelectedCase(caseItem)
    setActiveTab("details")
  }

  // Mock function to simulate multiple documents
  const getCaseDocuments = (caseItem) => {
    // Ensure caseItem is not null before accessing properties
    if (!caseItem) return []
    
    // In a real app, this would come from your API
    const documents = [
      {
        url: caseItem.caseDocument || "https://example.com/sample.pdf",
        name: "Case Document",
        type: "pdf",
        uploadedOn: "2023-10-15",
      },
    ]

    // Add mock documents if there's only one
    if (documents.length === 1) {
      documents.push({
        url: "https://example.com/contract.pdf",
        name: "Contract Agreement",
        type: "pdf",
        uploadedOn: "2023-10-20",
      })
      documents.push({
        url: "https://example.com/evidence.jpg",
        name: "Evidence Photo",
        type: "image",
        uploadedOn: "2023-11-05",
      })
    }

    return documents
  }

  const openDocumentViewer = (url) => {
    setCurrentDocUrl(url)
    setZoomLevel(1)
    setRotation(0)
    setShowDocViewer(true)
  }

  const closeDocumentViewer = () => {
    setShowDocViewer(false)
    setCurrentDocUrl("")
    setZoomLevel(1)
    setRotation(0)
  }

  const handleZoom = (factor) => {
    setZoomLevel((prev) => {
      const newZoom = prev + factor
      return Math.min(Math.max(0.5, newZoom), 3)
    })
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Mock payment data
  const getPaymentData = (caseItem) => {
    // Ensure caseItem is not null before accessing properties
    if (!caseItem) return []
    
    return [
      {
        id: 1,
        amount: 500,
        status: "Paid",
        date: "2023-10-10",
        description: "Initial consultation fee",
      },
      {
        id: 2,
        amount: 1000,
        status: "Paid",
        date: "2023-11-15",
        description: "Document preparation",
      },
      {
        id: 3,
        amount: 1500,
        status: "Pending",
        date: "2023-12-01",
        description: "Court filing fees",
      },
    ]
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading cases...</div>
  }

  if (!selectedCase) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Your Cases</h1>

        {cases.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">You don't have any cases yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick(caseItem)}
              >
                <h2 className="text-xl font-semibold mb-2 truncate">{caseItem.description}</h2>

                {accountType === "Provider" && caseItem.clientName && (
                  <div className="mb-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Client:</span> {caseItem.clientName}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      caseItem.status === "Open"
                        ? "bg-blue-100 text-blue-800"
                        : caseItem.status === "In-Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : caseItem.status === "Closed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {caseItem.status}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(caseItem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      {/* Back button and case title */}
      <div className="flex items-center mb-6 mt-4">
        <button onClick={() => setSelectedCase(null)} className="mr-4 text-gray-500 hover:text-black">
          <ChevronLeft className="size-5" />
        </button>
      </div>

      {/* Case details card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Case Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="size-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Created On</p>
                  <p className="font-medium">{selectedCase?.createdAt ? new Date(selectedCase.createdAt).toLocaleDateString() : "Unknown"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Folder className="size-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedCase?.category || "General"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="size-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCase?.status === "Open"
                        ? "bg-blue-100 text-blue-800"
                        : selectedCase?.status === "In-Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedCase?.status === "Closed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedCase?.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {accountType === "Provider" && selectedCase?.clientName && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Client Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <User className="size-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedCase.clientName}</p>
                  </div>
                </div>
                <div className="flex items-start mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 text-gray-500 mr-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 17.5l-9.9 1.16-9.9-1.16a1 1 0 0 0-1.1.87v3.38a1 1 0 0 0 .9.95l10 1.15 10-1.15a1 1 0 0 0 .9-.95v-3.38a1 1 0 0 0-1.1-.87z"></path>
                    <path d="M6.89 6.89A3.2 3.2 0 0 1 2 5.5V17"></path>
                    <path d="M22 5.5a3.2 3.2 0 0 1-4.89 1.39"></path>
                    <path d="M10.31 7.9A3.2 3.2 0 0 1 5.5 5.5V17"></path>
                    <path d="M18.5 5.5a3.2 3.2 0 0 1-4.81 2.4"></path>
                    <path d="M2 17v5"></path>
                    <path d="M22 17v5"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedCase.clientEmail || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 text-gray-500 mr-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{selectedCase.clientContact || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("milestones")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "milestones"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payments"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payments
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Case Description</h2>
            <p className="text-gray-700 mb-6">{selectedCase?.description || "No description available"}</p>

            <h3 className="text-lg font-medium mb-3">Additional Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <span className="font-medium">Case ID:</span>{" "}
                {selectedCase?.id || "#" + Math.floor(Math.random() * 10000)}
              </p>
              <p className="mb-2">
                <span className="font-medium">Filed Date:</span>{" "}
                {selectedCase?.filedDate || (selectedCase?.createdAt ? new Date(selectedCase.createdAt).toLocaleDateString() : "Unknown")}
              </p>
              <p>
                <span className="font-medium">Court:</span> {selectedCase?.court || "District Court"}
              </p>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Case Documents</h2>
              <button className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-black/80">
                <Plus className="mr-2 size-4" />
                Upload Document
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Uploaded On
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCaseDocuments(selectedCase).map((doc, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {doc.type === "pdf" ? (
                            <FileText className="size-5 text-gray-400 mr-3" />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="size-5 text-gray-400 mr-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          )}
                          <span className="font-medium text-gray-900">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {doc.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadedOn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDocumentViewer(doc.url)}
                          className="text-black hover:text-gray-700 mr-4"
                        >
                          View
                        </button>
                        <a
                          href={doc.url}
                          download
                          className="text-black hover:text-gray-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === "milestones" && (
          <div>
            <MilestoneManagement />
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <button className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-black/80">
                <Plus className="mr-2 size-4" />
                Add Payment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaymentData(selectedCase).map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{payment.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Paid:</span>
                <span className="font-bold text-lg">
                ₹
                  {getPaymentData(selectedCase)
                    .filter((p) => p.status === "Paid")
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Pending:</span>
                <span className="font-bold text-lg">
                  ₹
                  {getPaymentData(selectedCase)
                    .filter((p) => p.status === "Pending")
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showDocViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
          {/* Document Viewer Header */}
          <div className="bg-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <button onClick={closeDocumentViewer} className="mr-4 text-gray-700 hover:text-black">
                <X className="size-5" />
              </button>
              <h3 className="font-medium text-lg">Document Viewer</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleZoom(-0.1)} className="p-2 rounded-full hover:bg-gray-100" title="Zoom Out">
                <ZoomOut className="size-5" />
              </button>
              <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => handleZoom(0.1)} className="p-2 rounded-full hover:bg-gray-100" title="Zoom In">
                <ZoomIn className="size-5" />
              </button>
              <button onClick={handleRotate} className="p-2 rounded-full hover:bg-gray-100" title="Rotate">
                <RotateCw className="size-5" />
              </button>
              <a
                href={currentDocUrl}
                download
                className="p-2 rounded-full hover:bg-gray-100"
                title="Download"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="size-5" />
              </a>
            </div>
          </div>

          {/* Document Viewer Content */}
          <div className="flex-1 flex items-center justify-center relative bg-gray-800 overflow-hidden">
            {currentDocUrl.match(/\.(pdf)$/i) ? (
              <iframe
                src={`${currentDocUrl}#view=FitH`}
                className="w-full h-full border-0 bg-white"
                title="Case Document"
              />
            ) : currentDocUrl.match(/\.(jpe?g|png|gif|bmp|webp)$/i) ? (
              <div className="flex items-center justify-center h-full">
                <img
                  src={currentDocUrl || "/placeholder.svg"}
                  alt="Case Document"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4 bg-white">
                <div className="text-center">
                  <FileText className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-2">This document can't be previewed in the browser.</p>
                  <a
                    href={currentDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block px-4 py-2 bg-black text-white rounded hover:bg-black/80 transition-colors"
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CaseYour

